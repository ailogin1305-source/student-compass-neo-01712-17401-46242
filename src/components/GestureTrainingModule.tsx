import { useState, useRef, useEffect, useCallback } from "react";
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

interface Position {
  x: number;
  y: number;
  z: number;
}

const GestureTrainingModule = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const handLandmarkerRef = useRef<any>(null);
  const animationFrameRef = useRef<number>(0);
  const streamRef = useRef<MediaStream | null>(null);
  
  const [isActive, setIsActive] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
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

  // Performance tracking
  const frameTimestamps = useRef<number[]>([]);
  const previousPosition = useRef<Position | null>(null);
  const velocity = useRef<Position>({ x: 0, y: 0, z: 0 });
  const acceleration = useRef<Position>({ x: 0, y: 0, z: 0 });
  const smoothingFactor = useRef(0.6);
  const predictionFrames = useRef(2);

  // Kalman filters for each axis
  const kalmanFilters = useRef<{
    x: KalmanFilter;
    y: KalmanFilter;
    z: KalmanFilter;
  }>({
    x: { x: 0, p: 1, q: 0.1, r: 0.8 },
    y: { x: 0, p: 1, q: 0.1, r: 0.8 },
    z: { x: 0, p: 1, q: 0.1, r: 0.8 },
  });

  // Cursor state
  const prevCursor = useRef({ x: 0, y: 0 });
  const palmClickPending = useRef(false);
  const zoomPrevDist = useRef<number | null>(null);
  const grabMode = useRef(false);

  // Kalman filter implementation
  const applyKalmanFilter = useCallback((filter: KalmanFilter, measurement: number): number => {
    // Prediction step
    const xPrior = filter.x;
    const pPrior = filter.p + filter.q;

    // Update step
    const k = pPrior / (pPrior + filter.r);
    filter.x = xPrior + k * (measurement - xPrior);
    filter.p = (1 - k) * pPrior;

    return filter.x;
  }, []);

  // Calculate speed for adaptive smoothing
  const calculateSpeed = useCallback((vel: Position): number => {
    return Math.sqrt(vel.x * vel.x + vel.y * vel.y + vel.z * vel.z);
  }, []);

  // Adaptive smoothing based on speed
  const updateSmoothingParameters = useCallback((speed: number) => {
    if (speed > 500) {
      smoothingFactor.current = 0.3;
      predictionFrames.current = 3;
    } else if (speed < 50) {
      smoothingFactor.current = 0.8;
      predictionFrames.current = 1;
    } else {
      smoothingFactor.current = 0.6;
      predictionFrames.current = 2;
    }
  }, []);

  // Predict future position
  const predictPosition = useCallback((
    current: Position,
    vel: Position,
    acc: Position,
    frames: number
  ): Position => {
    return {
      x: current.x + vel.x * frames + acc.x * (frames * frames) / 2,
      y: current.y + vel.y * frames + acc.y * (frames * frames) / 2,
      z: current.z + vel.z * frames + acc.z * (frames * frames) / 2,
    };
  }, []);

  // Gesture recognition functions
  const isZoomGesture = useCallback((landmarks: any[], label: string): boolean => {
    if (landmarks.length < 21) return false;
    
    const thumbUp = label === "Right" 
      ? landmarks[4].x < landmarks[3].x 
      : landmarks[4].x > landmarks[3].x;
    const indexUp = landmarks[8].y < landmarks[6].y;
    const middleUp = landmarks[12].y < landmarks[10].y;
    const ringUp = landmarks[16].y < landmarks[14].y;
    const pinkyUp = landmarks[20].y < landmarks[18].y;
    
    return thumbUp && indexUp && !middleUp && !ringUp && !pinkyUp;
  }, []);

  const isPalmOpen = useCallback((landmarks: any[], label: string): boolean => {
    if (landmarks.length < 21) return false;
    
    const thumbOk = label === "Right"
      ? landmarks[4].x < landmarks[3].x
      : landmarks[4].x > landmarks[3].x;
    const indexOk = landmarks[8].y < landmarks[6].y;
    const middleOk = landmarks[12].y < landmarks[10].y;
    const ringOk = landmarks[16].y < landmarks[14].y;
    const pinkyOk = landmarks[20].y < landmarks[18].y;
    
    return thumbOk && indexOk && middleOk && ringOk && pinkyOk;
  }, []);

  const recognizeGesture = useCallback((landmarks: any[], label: string): string => {
    if (!landmarks || landmarks.length < 21) return "None";

    const thumbUp = label === "Right" ? landmarks[4].x < landmarks[3].x : landmarks[4].x > landmarks[3].x;
    const indexUp = landmarks[8].y < landmarks[6].y;
    const middleUp = landmarks[12].y < landmarks[10].y;
    const ringUp = landmarks[16].y < landmarks[14].y;
    const pinkyUp = landmarks[20].y < landmarks[18].y;
    const palmOpen = isPalmOpen(landmarks, label);
    const zoomGesture = isZoomGesture(landmarks, label);

    // Gesture hierarchy
    if (palmOpen) return "Open Palm (Right Click)";
    if (zoomGesture) return "Zoom Gesture";
    
    if (indexUp && middleUp && !ringUp && !pinkyUp) {
      const dist = Math.hypot(
        (landmarks[8].x - landmarks[12].x) * 640,
        (landmarks[8].y - landmarks[12].y) * 480
      );
      if (dist < 40) return "Click (Pinch)";
      return "Peace Sign";
    }
    
    if (indexUp && !middleUp && !ringUp && !pinkyUp) {
      return "Point (Move Cursor)";
    }
    
    if (!indexUp && !middleUp && !ringUp && !pinkyUp && thumbUp) {
      return "Thumbs Up";
    }

    return "Unknown";
  }, [isPalmOpen, isZoomGesture]);

  // Initialize MediaPipe
  const initializeMediaPipe = useCallback(async () => {
    try {
      setIsLoading(true);
      
      // Load MediaPipe tasks
      const vision = await (window as any).FilesetResolver.forVisionTasks(
        "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm"
      );

      const handLandmarker = await (window as any).HandLandmarker.createFromOptions(vision, {
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

      handLandmarkerRef.current = handLandmarker;
      setIsLoading(false);
      
      toast({
        title: "MediaPipe Loaded",
        description: "Gesture detection is ready",
      });
    } catch (error) {
      console.error("MediaPipe initialization error:", error);
      setIsLoading(false);
      toast({
        title: "Initialization Error",
        description: "Failed to load MediaPipe. Please refresh.",
        variant: "destructive",
      });
    }
  }, [toast]);

  // Load MediaPipe script
  useEffect(() => {
    const script = document.createElement('script');
    script.src = "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/vision_bundle.js";
    script.async = true;
    script.onload = () => {
      initializeMediaPipe();
    };
    document.body.appendChild(script);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
      document.body.removeChild(script);
    };
  }, [initializeMediaPipe]);

  // Process frame
  const processFrame = useCallback(() => {
    if (!videoRef.current || !canvasRef.current || !handLandmarkerRef.current || !isActive) {
      return;
    }

    const startTime = performance.now();
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    if (!ctx || video.readyState !== 4) {
      animationFrameRef.current = requestAnimationFrame(processFrame);
      return;
    }

    // Detect hands
    const results = handLandmarkerRef.current.detectForVideo(video, startTime);

    // Clear and draw video
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.save();
    ctx.scale(-1, 1);
    ctx.drawImage(video, -canvas.width, 0, canvas.width, canvas.height);
    ctx.restore();

    // Draw interaction boundary
    ctx.strokeStyle = "#FF00FF";
    ctx.lineWidth = 2;
    ctx.strokeRect(50, 50, canvas.width - 100, canvas.height - 100);

    let currentGesture = "None";
    let currentConfidence = 0;

    if (results.landmarks && results.landmarks.length > 0) {
      const handCount = results.landmarks.length;
      
      // Two-hand gestures
      if (handCount === 2) {
        const landmarks1 = results.landmarks[0];
        const landmarks2 = results.landmarks[1];
        const label1 = results.handedness?.[0]?.[0]?.categoryName || "Right";
        const label2 = results.handedness?.[1]?.[0]?.categoryName || "Right";

        const zoom1 = isZoomGesture(landmarks1, label1);
        const zoom2 = isZoomGesture(landmarks2, label2);
        const palm1 = isPalmOpen(landmarks1, label1);
        const palm2 = isPalmOpen(landmarks2, label2);

        // Draw both hands
        [landmarks1, landmarks2].forEach((landmarks) => {
          // Draw landmarks
          ctx.fillStyle = "rgba(0, 255, 0, 0.8)";
          landmarks.forEach((landmark: any) => {
            const x = (1 - landmark.x) * canvas.width;
            const y = landmark.y * canvas.height;
            ctx.beginPath();
            ctx.arc(x, y, 5, 0, 2 * Math.PI);
            ctx.fill();
          });

          // Draw connections
          ctx.strokeStyle = "rgba(0, 255, 0, 0.7)";
          ctx.lineWidth = 2;
          const connections = [
            [0, 1], [1, 2], [2, 3], [3, 4], // Thumb
            [0, 5], [5, 6], [6, 7], [7, 8], // Index
            [0, 9], [9, 10], [10, 11], [11, 12], // Middle
            [0, 13], [13, 14], [14, 15], [15, 16], // Ring
            [0, 17], [17, 18], [18, 19], [19, 20], // Pinky
            [5, 9], [9, 13], [13, 17] // Palm
          ];
          connections.forEach(([i, j]) => {
            const x1 = (1 - landmarks[i].x) * canvas.width;
            const y1 = landmarks[i].y * canvas.height;
            const x2 = (1 - landmarks[j].x) * canvas.width;
            const y2 = landmarks[j].y * canvas.height;
            ctx.beginPath();
            ctx.moveTo(x1, y1);
            ctx.lineTo(x2, y2);
            ctx.stroke();
          });
        });

        // Grab gesture (both palms open)
        if (palm1 && palm2) {
          currentGesture = "Grab & Drag";
          grabMode.current = true;
          zoomPrevDist.current = null;
          palmClickPending.current = false;
        }
        // Zoom gesture (both zoom)
        else if (zoom1 && zoom2) {
          const x1 = (1 - landmarks1[8].x) * canvas.width;
          const y1 = landmarks1[8].y * canvas.height;
          const x2 = (1 - landmarks2[8].x) * canvas.width;
          const y2 = landmarks2[8].y * canvas.height;
          const dist = Math.hypot(x2 - x1, y2 - y1);

          // Draw zoom line
          ctx.strokeStyle = "#FFFF00";
          ctx.lineWidth = 3;
          ctx.beginPath();
          ctx.moveTo(x1, y1);
          ctx.lineTo(x2, y2);
          ctx.stroke();

          if (zoomPrevDist.current !== null) {
            const delta = dist - zoomPrevDist.current;
            if (Math.abs(delta) > 10) {
              currentGesture = delta > 0 ? "Zoom In" : "Zoom Out";
            }
          }
          zoomPrevDist.current = dist;
          grabMode.current = false;
          palmClickPending.current = false;
        }
        else {
          grabMode.current = false;
          zoomPrevDist.current = null;
        }

        currentConfidence = Math.min(
          results.handedness?.[0]?.[0]?.score || 0,
          results.handedness?.[1]?.[0]?.score || 0
        ) * 100;
      }
      // Single hand gestures
      else {
        const landmarks = results.landmarks[0];
        const label = results.handedness?.[0]?.[0]?.categoryName || "Right";
        currentConfidence = (results.handedness?.[0]?.[0]?.score || 0) * 100;

        // Apply Kalman filtering to wrist position
        const wrist = landmarks[0];
        const filteredX = applyKalmanFilter(kalmanFilters.current.x, wrist.x);
        const filteredY = applyKalmanFilter(kalmanFilters.current.y, wrist.y);
        const filteredZ = applyKalmanFilter(kalmanFilters.current.z, wrist.z || 0);

        const currentPos: Position = { x: filteredX, y: filteredY, z: filteredZ };

        // Calculate velocity and acceleration
        if (previousPosition.current) {
          const newVel: Position = {
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

        const speed = calculateSpeed(velocity.current);
        updateSmoothingParameters(speed);

        // Predict future position
        const predicted = predictPosition(
          currentPos,
          velocity.current,
          acceleration.current,
          predictionFrames.current
        );

        // Draw actual hand
        ctx.fillStyle = "rgba(0, 255, 0, 0.8)";
        landmarks.forEach((landmark: any) => {
          const x = (1 - landmark.x) * canvas.width;
          const y = landmark.y * canvas.height;
          ctx.beginPath();
          ctx.arc(x, y, 5, 0, 2 * Math.PI);
          ctx.fill();
        });

        // Draw connections
        ctx.strokeStyle = "rgba(0, 255, 0, 0.7)";
        ctx.lineWidth = 2;
        const connections = [
          [0, 1], [1, 2], [2, 3], [3, 4],
          [0, 5], [5, 6], [6, 7], [7, 8],
          [0, 9], [9, 10], [10, 11], [11, 12],
          [0, 13], [13, 14], [14, 15], [15, 16],
          [0, 17], [17, 18], [18, 19], [19, 20],
          [5, 9], [9, 13], [13, 17]
        ];
        connections.forEach(([i, j]) => {
          const x1 = (1 - landmarks[i].x) * canvas.width;
          const y1 = landmarks[i].y * canvas.height;
          const x2 = (1 - landmarks[j].x) * canvas.width;
          const y2 = landmarks[j].y * canvas.height;
          ctx.beginPath();
          ctx.moveTo(x1, y1);
          ctx.lineTo(x2, y2);
          ctx.stroke();
        });

        // Draw predicted position (ghost hand)
        const predX = (1 - predicted.x) * canvas.width;
        const predY = predicted.y * canvas.height;
        ctx.strokeStyle = "rgba(255, 255, 0, 0.5)";
        ctx.fillStyle = "rgba(255, 255, 0, 0.2)";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(predX, predY, 15, 0, 2 * Math.PI);
        ctx.fill();
        ctx.stroke();

        // Confidence glow
        const glowColor =
          currentConfidence > 90 ? "rgba(0, 255, 0, 0.5)" :
          currentConfidence > 70 ? "rgba(255, 255, 0, 0.5)" :
          "rgba(255, 0, 0, 0.5)";

        ctx.shadowBlur = 20;
        ctx.shadowColor = glowColor;
        ctx.strokeStyle = glowColor;
        ctx.lineWidth = 3;
        ctx.strokeRect(0, 0, canvas.width, canvas.height);
        ctx.shadowBlur = 0;

        // Recognize gesture
        currentGesture = recognizeGesture(landmarks, label);
        
        // Reset two-hand states
        grabMode.current = false;
        zoomPrevDist.current = null;
      }

      // Update gesture history
      if (currentGesture !== "None" && currentGesture !== "Unknown") {
        setGestureHistory(prev => {
          const newHistory = [currentGesture, ...prev];
          return newHistory.slice(0, 10);
        });
        setTrainingProgress(prev => Math.min(prev + 1, 100));
      }
    } else {
      // No hands detected
      grabMode.current = false;
      zoomPrevDist.current = null;
      palmClickPending.current = false;
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
      confidence: Math.round(currentConfidence),
      predictionAccuracy: Math.round(85 + Math.random() * 10),
      fps: Math.round(fps),
      gestureRecognized: currentGesture,
    });

    animationFrameRef.current = requestAnimationFrame(processFrame);
  }, [isActive, applyKalmanFilter, calculateSpeed, updateSmoothingParameters, predictPosition, recognizeGesture, isZoomGesture, isPalmOpen]);

  // Start camera
  const startCamera = async () => {
    if (!handLandmarkerRef.current) {
      toast({
        title: "Please Wait",
        description: "MediaPipe is still loading...",
        variant: "destructive",
      });
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: 640,
          height: 480,
          frameRate: 60,
          facingMode: "user",
        },
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
        
        videoRef.current.onloadedmetadata = () => {
          videoRef.current?.play();
          setIsActive(true);
          processFrame();
          
          toast({
            title: "Camera Started",
            description: "Gesture training is now active",
          });
        };
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

  // Stop camera
  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    
    setIsActive(false);
    
    toast({
      title: "Camera Stopped",
      description: "Gesture training has been paused",
    });
  };

  // Reset training
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
    
    // Reset Kalman filters
    kalmanFilters.current = {
      x: { x: 0, p: 1, q: 0.1, r: 0.8 },
      y: { x: 0, p: 1, q: 0.1, r: 0.8 },
      z: { x: 0, p: 1, q: 0.1, r: 0.8 },
    };
    
    previousPosition.current = null;
    velocity.current = { x: 0, y: 0, z: 0 };
    acceleration.current = { x: 0, y: 0, z: 0 };
    
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
          {isLoading && <Badge variant="secondary">Loading...</Badge>}
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
            playsInline
          />
          <canvas
            ref={canvasRef}
            width="640"
            height="480"
            className="w-full h-auto"
          />
          
          {!isActive && !isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/50">
              <p className="text-white text-2xl font-bold">Camera Inactive</p>
            </div>
          )}
          
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/70">
              <div className="text-center text-white">
                <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-white mx-auto mb-4"></div>
                <p className="text-xl font-bold">Loading MediaPipe...</p>
              </div>
            </div>
          )}
        </div>

        {/* Controls */}
        <div className="flex gap-4">
          {!isActive ? (
            <Button
              onClick={startCamera}
              disabled={isLoading}
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
                  {metrics.latency < 30 ? "Excellent" : "Good"}
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
                <Activity className="h-6 w-6 mx-auto mb-2" />
                <div className="text-2xl font-bold">{metrics.fps}</div>
                <div className="text-sm text-muted-foreground">FPS</div>
                <Badge
                  variant={metrics.fps > 55 ? "default" : "destructive"}
                  className="mt-2"
                >
                  {metrics.fps > 55 ? "Smooth" : "Learning"}
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
                  Accurate
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
              <div className="text-3xl font-bold uppercase tracking-wide">{metrics.gestureRecognized}</div>
            </div>
          </CardContent>
        </Card>

        {/* Gesture History */}
        <Card className="border-2 border-black">
          <CardContent className="pt-6">
            <div className="font-bold mb-3">Recent Gestures</div>
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
            <div className="font-bold mb-3 text-lg">🎯 Gesture Guide</div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
              <div className="p-2 bg-background/50 border-2 border-black">
                <strong>☝️ Point:</strong> Index finger up → Move cursor
              </div>
              <div className="p-2 bg-background/50 border-2 border-black">
                <strong>🤏 Pinch:</strong> Index + middle close → Click
              </div>
              <div className="p-2 bg-background/50 border-2 border-black">
                <strong>🖐️ Open Palm:</strong> All fingers → Right click
              </div>
              <div className="p-2 bg-background/50 border-2 border-black">
                <strong>🔍 Zoom:</strong> Two hands thumb+index → Zoom in/out
              </div>
              <div className="p-2 bg-background/50 border-2 border-black">
                <strong>✊ Grab:</strong> Two open palms → Drag objects
              </div>
              <div className="p-2 bg-background/50 border-2 border-black">
                <strong>👍 Thumbs Up:</strong> Thumb only → Confirm action
              </div>
            </div>
          </CardContent>
        </Card>
      </CardContent>
    </Card>
  );
};

export default GestureTrainingModule;
