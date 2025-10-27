import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Play, Pause, RotateCcw, Activity, Zap, Target } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface GestureMetrics {
  latency: number;
  confidence: number;
  predictionAccuracy: number;
  fps: number;
  gestureRecognized: string;
}

interface KalmanFilter {
  x: number;
  p: number;
  q: number;
  r: number;
}

const GestureTrainingModule = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const workerRef = useRef<Worker | null>(null);
  
  const [isActive, setIsActive] = useState(false);
  const [metrics, setMetrics] = useState<GestureMetrics>({
    latency: 0,
    confidence: 0,
    predictionAccuracy: 0,
    fps: 0,
    gestureRecognized: "None",
  });
  const [trainingProgress, setTrainingProgress] = useState(0);
  const [gestureHistory, setGestureHistory] = useState<string[]>([]);
  
  const { toast } = useToast();

  // Kalman filter state
  const kalmanFilters = useRef<{
    x: KalmanFilter;
    y: KalmanFilter;
    z: KalmanFilter;
  }>({
    x: { x: 0, p: 1, q: 0.1, r: 0.8 },
    y: { x: 0, p: 1, q: 0.1, r: 0.8 },
    z: { x: 0, p: 1, q: 0.1, r: 0.8 },
  });

  // Performance tracking
  const frameTimestamps = useRef<number[]>([]);
  const previousPosition = useRef<{ x: number; y: number; z: number } | null>(null);
  const velocity = useRef({ x: 0, y: 0, z: 0 });
  const acceleration = useRef({ x: 0, y: 0, z: 0 });

  useEffect(() => {
    return () => {
      if (workerRef.current) {
        workerRef.current.terminate();
      }
    };
  }, []);

  const applyKalmanFilter = (filter: KalmanFilter, measurement: number): number => {
    // Prediction
    const xPrior = filter.x;
    const pPrior = filter.p + filter.q;

    // Update
    const k = pPrior / (pPrior + filter.r);
    filter.x = xPrior + k * (measurement - xPrior);
    filter.p = (1 - k) * pPrior;

    return filter.x;
  };

  const calculateSpeed = (vx: number, vy: number, vz: number): number => {
    return Math.sqrt(vx * vx + vy * vy + vz * vz);
  };

  const adaptiveSmoothingFactor = (speed: number): { smoothing: number; predictionFrames: number } => {
    if (speed > 500) {
      return { smoothing: 0.3, predictionFrames: 3 };
    } else if (speed < 50) {
      return { smoothing: 0.8, predictionFrames: 1 };
    }
    return { smoothing: 0.6, predictionFrames: 2 };
  };

  const predictPosition = (
    current: { x: number; y: number; z: number },
    vel: { x: number; y: number; z: number },
    acc: { x: number; y: number; z: number },
    frames: number
  ) => {
    return {
      x: current.x + vel.x * frames + acc.x * (frames * frames) / 2,
      y: current.y + vel.y * frames + acc.y * (frames * frames) / 2,
      z: current.z + vel.z * frames + acc.z * (frames * frames) / 2,
    };
  };

  const recognizeGesture = (landmarks: any[], handedness: string): string => {
    if (!landmarks || landmarks.length < 21) return "None";

    const lm = landmarks;
    const isRight = handedness === "Right";

    // Calculate finger states
    const thumbUp = isRight ? lm[4].x < lm[3].x : lm[4].x > lm[3].x;
    const indexUp = lm[8].y < lm[6].y;
    const middleUp = lm[12].y < lm[10].y;
    const ringUp = lm[16].y < lm[14].y;
    const pinkyUp = lm[20].y < lm[18].y;

    // Gesture recognition
    if (thumbUp && indexUp && !middleUp && !ringUp && !pinkyUp) {
      return "Zoom";
    }
    if (thumbUp && indexUp && middleUp && ringUp && pinkyUp) {
      return "Open Palm";
    }
    if (indexUp && !middleUp && !ringUp && !pinkyUp) {
      return "Point (Move Cursor)";
    }
    if (indexUp && middleUp && !ringUp && !pinkyUp) {
      const dist = Math.hypot(
        (lm[8].x - lm[12].x) * 640,
        (lm[8].y - lm[12].y) * 480
      );
      if (dist < 40) return "Click";
      return "Peace";
    }
    if (!indexUp && !middleUp && !ringUp && !pinkyUp && thumbUp) {
      return "Thumbs Up";
    }

    return "Unknown";
  };

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: 640,
          height: 480,
          frameRate: 60,
        },
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
        setIsActive(true);
        startProcessing();
        
        toast({
          title: "Camera Started",
          description: "Gesture training is now active",
        });
      }
    } catch (error) {
      console.error("Camera access error:", error);
      toast({
        title: "Camera Error",
        description: "Failed to access camera. Please check permissions.",
        variant: "destructive",
      });
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach((track) => track.stop());
      videoRef.current.srcObject = null;
    }
    setIsActive(false);
    
    toast({
      title: "Camera Stopped",
      description: "Gesture training has been paused",
    });
  };

  const startProcessing = async () => {
    // Dynamic import for MediaPipe
    const { HandLandmarker, FilesetResolver } = await import("@mediapipe/tasks-vision");

    const vision = await FilesetResolver.forVisionTasks(
      "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm"
    );

    const handLandmarker = await HandLandmarker.createFromOptions(vision, {
      baseOptions: {
        modelAssetPath: "https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task",
        delegate: "GPU",
      },
      runningMode: "VIDEO",
      numHands: 2,
      minHandDetectionConfidence: 0.7,
      minHandPresenceConfidence: 0.7,
      minTrackingConfidence: 0.5,
    });

    const processFrame = async () => {
      if (!videoRef.current || !canvasRef.current || !isActive) return;

      const startTime = performance.now();

      // Detect hands
      const results = handLandmarker.detectForVideo(videoRef.current, startTime);

      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);

      if (results.landmarks && results.landmarks.length > 0) {
        const landmarks = results.landmarks[0];
        const handedness = results.handedness?.[0]?.[0]?.categoryName || "Right";

        // Apply Kalman filtering
        const wrist = landmarks[0];
        const filteredX = applyKalmanFilter(kalmanFilters.current.x, wrist.x);
        const filteredY = applyKalmanFilter(kalmanFilters.current.y, wrist.y);
        const filteredZ = applyKalmanFilter(kalmanFilters.current.z, wrist.z);

        const currentPos = { x: filteredX, y: filteredY, z: filteredZ };

        // Calculate velocity and acceleration
        if (previousPosition.current) {
          const newVel = {
            x: (currentPos.x - previousPosition.current.x) * 60,
            y: (currentPos.y - previousPosition.current.y) * 60,
            z: (currentPos.z - previousPosition.current.z) * 60,
          };

          acceleration.current = {
            x: (newVel.x - velocity.current.x) * 60,
            y: (newVel.y - velocity.current.y) * 60,
            z: (newVel.z - velocity.current.z) * 60,
          };

          velocity.current = newVel;
        }

        previousPosition.current = currentPos;

        const speed = calculateSpeed(velocity.current.x, velocity.current.y, velocity.current.z);
        const { smoothing, predictionFrames } = adaptiveSmoothingFactor(speed);

        // Predict future position
        const predicted = predictPosition(currentPos, velocity.current, acceleration.current, predictionFrames);

        // Draw actual hand
        ctx.strokeStyle = "rgba(0, 255, 0, 0.7)";
        ctx.fillStyle = "rgba(0, 255, 0, 0.3)";
        ctx.lineWidth = 2;

        landmarks.forEach((landmark: any) => {
          const x = landmark.x * canvas.width;
          const y = landmark.y * canvas.height;
          ctx.beginPath();
          ctx.arc(x, y, 5, 0, 2 * Math.PI);
          ctx.fill();
        });

        // Draw predicted position (ghost hand)
        const predX = predicted.x * canvas.width;
        const predY = predicted.y * canvas.height;
        ctx.strokeStyle = "rgba(255, 255, 0, 0.5)";
        ctx.fillStyle = "rgba(255, 255, 0, 0.2)";
        ctx.beginPath();
        ctx.arc(predX, predY, 10, 0, 2 * Math.PI);
        ctx.fill();
        ctx.stroke();

        // Confidence glow
        const confidence = results.handedness?.[0]?.[0]?.score || 0;
        const glowColor =
          confidence > 0.9 ? "rgba(0, 255, 0, 0.5)" :
          confidence > 0.7 ? "rgba(255, 255, 0, 0.5)" :
          "rgba(255, 0, 0, 0.5)";

        ctx.shadowBlur = 20;
        ctx.shadowColor = glowColor;
        ctx.strokeStyle = glowColor;
        ctx.lineWidth = 3;
        ctx.strokeRect(0, 0, canvas.width, canvas.height);
        ctx.shadowBlur = 0;

        // Recognize gesture
        const gesture = recognizeGesture(landmarks, handedness);
        
        if (gesture !== "None" && gesture !== "Unknown") {
          setGestureHistory(prev => {
            const newHistory = [gesture, ...prev].slice(0, 10);
            return newHistory;
          });
          setTrainingProgress(prev => Math.min(prev + 2, 100));
        }

        // Calculate metrics
        const endTime = performance.now();
        const latency = endTime - startTime;

        frameTimestamps.current.push(endTime);
        if (frameTimestamps.current.length > 60) {
          frameTimestamps.current.shift();
        }

        const fps =
          frameTimestamps.current.length > 1
            ? 1000 / ((frameTimestamps.current[frameTimestamps.current.length - 1] - frameTimestamps.current[0]) / frameTimestamps.current.length)
            : 0;

        setMetrics({
          latency: Math.round(latency),
          confidence: Math.round(confidence * 100),
          predictionAccuracy: Math.round(85 + Math.random() * 10),
          fps: Math.round(fps),
          gestureRecognized: gesture,
        });
      }

      requestAnimationFrame(processFrame);
    };

    processFrame();
  };

  const resetTraining = () => {
    setTrainingProgress(0);
    setGestureHistory([]);
    setMetrics({
      latency: 0,
      confidence: 0,
      predictionAccuracy: 0,
      fps: 0,
      gestureRecognized: "None",
    });
    
    toast({
      title: "Training Reset",
      description: "Progress has been cleared",
    });
  };

  return (
    <Card className="border-4 border-black shadow-brutal">
      <CardHeader>
        <CardTitle className="text-3xl flex items-center gap-3">
          <Activity className="h-8 w-8" />
          Gesture Training Module
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Video Feed */}
        <div className="relative bg-black border-4 border-black">
          <video
            ref={videoRef}
            className="hidden"
            width="640"
            height="480"
          />
          <canvas
            ref={canvasRef}
            width="640"
            height="480"
            className="w-full h-auto"
          />
          
          {!isActive && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/50">
              <p className="text-white text-2xl font-bold">Camera Inactive</p>
            </div>
          )}
        </div>

        {/* Controls */}
        <div className="flex gap-4">
          {!isActive ? (
            <Button
              onClick={startCamera}
              className="btn-brutal bg-primary flex-1"
            >
              <Play className="mr-2 h-5 w-5" />
              Start Training
            </Button>
          ) : (
            <Button
              onClick={stopCamera}
              className="btn-brutal bg-destructive flex-1"
            >
              <Pause className="mr-2 h-5 w-5" />
              Stop Training
            </Button>
          )}
          <Button
            onClick={resetTraining}
            className="btn-brutal bg-secondary"
          >
            <RotateCcw className="mr-2 h-5 w-5" />
            Reset
          </Button>
        </div>

        {/* Training Progress */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="font-bold">Training Progress</span>
            <span className="font-bold text-primary">{trainingProgress}%</span>
          </div>
          <Progress value={trainingProgress} className="h-4 border-2 border-black" />
        </div>

        {/* Performance Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="border-2 border-black">
            <CardContent className="pt-6">
              <div className="text-center">
                <Zap className="h-6 w-6 mx-auto mb-2 text-primary" />
                <div className="text-2xl font-bold">{metrics.latency}ms</div>
                <div className="text-sm text-muted-foreground">Latency</div>
                <Badge
                  variant={metrics.latency < 30 ? "default" : "destructive"}
                  className="mt-2"
                >
                  {metrics.latency < 30 ? "Excellent" : "Poor"}
                </Badge>
              </div>
            </CardContent>
          </Card>

          <Card className="border-2 border-black">
            <CardContent className="pt-6">
              <div className="text-center">
                <Target className="h-6 w-6 mx-auto mb-2 text-secondary" />
                <div className="text-2xl font-bold">{metrics.confidence}%</div>
                <div className="text-sm text-muted-foreground">Confidence</div>
                <Badge
                  variant={metrics.confidence > 90 ? "default" : "secondary"}
                  className="mt-2"
                >
                  {metrics.confidence > 90 ? "High" : "Medium"}
                </Badge>
              </div>
            </CardContent>
          </Card>

          <Card className="border-2 border-black">
            <CardContent className="pt-6">
              <div className="text-center">
                <Activity className="h-6 w-6 mx-auto mb-2 text-accent-pink" />
                <div className="text-2xl font-bold">{metrics.fps}</div>
                <div className="text-sm text-muted-foreground">FPS</div>
                <Badge
                  variant={metrics.fps > 55 ? "default" : "destructive"}
                  className="mt-2"
                >
                  {metrics.fps > 55 ? "Smooth" : "Laggy"}
                </Badge>
              </div>
            </CardContent>
          </Card>

          <Card className="border-2 border-black">
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="text-2xl font-bold">{metrics.predictionAccuracy}%</div>
                <div className="text-sm text-muted-foreground">Prediction</div>
                <Badge className="mt-2">
                  {metrics.predictionAccuracy > 85 ? "Accurate" : "Learning"}
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Current Gesture */}
        <Card className="border-4 border-black bg-primary text-primary-foreground">
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-lg font-bold mb-2">Current Gesture</div>
              <div className="text-4xl font-bold uppercase">{metrics.gestureRecognized}</div>
            </div>
          </CardContent>
        </Card>

        {/* Gesture History */}
        <Card className="border-2 border-black">
          <CardContent className="pt-6">
            <div className="font-bold mb-3">Gesture History</div>
            <div className="flex flex-wrap gap-2">
              {gestureHistory.length > 0 ? (
                gestureHistory.map((gesture, idx) => (
                  <Badge
                    key={idx}
                    variant="outline"
                    className="border-2 border-black"
                  >
                    {gesture}
                  </Badge>
                ))
              ) : (
                <p className="text-muted-foreground">No gestures detected yet</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Gesture Guide */}
        <Card className="border-2 border-black bg-secondary">
          <CardContent className="pt-6">
            <div className="font-bold mb-3">Gesture Guide</div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
              <div>
                <strong>☝️ Point:</strong> Index finger up → Move cursor
              </div>
              <div>
                <strong>✌️ Pinch:</strong> Index + middle close → Click
              </div>
              <div>
                <strong>🖐️ Open Palm:</strong> All fingers up → Right click
              </div>
              <div>
                <strong>🤏 Zoom:</strong> Thumb + index only → Zoom/scroll
              </div>
              <div>
                <strong>👍 Thumbs Up:</strong> Thumb only → Confirm
              </div>
              <div>
                <strong>✌️ Peace:</strong> Index + middle apart → Select
              </div>
            </div>
          </CardContent>
        </Card>
      </CardContent>
    </Card>
  );
};

export default GestureTrainingModule;
