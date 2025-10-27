import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";

interface RescheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const RescheduleModal = ({ isOpen, onClose }: RescheduleModalProps) => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    date: "",
  });

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // For now, just close the modal
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="relative w-full max-w-md bg-white border-4 border-black shadow-brutal-lg p-6">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 hover:bg-primary/10 rounded"
        >
          <X className="h-5 w-5" />
        </button>

        <h2 className="text-3xl font-bold mb-6 text-foreground">Schedule Your Personal Demo</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name" className="font-bold">Name</Label>
            <Input
              id="name"
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="border-4 border-black mt-2"
              required
            />
          </div>

          <div>
            <Label htmlFor="email" className="font-bold">Email</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="border-4 border-black mt-2"
              required
            />
          </div>

          <div>
            <Label htmlFor="date" className="font-bold">Preferred Date</Label>
            <Input
              id="date"
              type="date"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              className="border-4 border-black mt-2"
              required
            />
          </div>

          <div className="flex gap-4 pt-4">
            <Button
              type="submit"
              className="flex-1 bg-primary border-4 border-black hover:bg-primary/90 font-bold"
            >
              Submit
            </Button>
            <Button
              type="button"
              onClick={onClose}
              variant="outline"
              className="flex-1 border-4 border-black font-bold"
            >
              Close
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RescheduleModal;
