import { Video } from "lucide-react";

interface IconProps {
  className?: string;
  size?: number;
}

export function VideoIcon({ className = "h-4 w-4", size }: IconProps) {
  return <Video className={className} size={size} />;
}