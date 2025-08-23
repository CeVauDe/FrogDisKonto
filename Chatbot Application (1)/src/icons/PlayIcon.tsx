import { Play } from "lucide-react";

interface IconProps {
  className?: string;
  size?: number;
}

export function PlayIcon({ className = "h-4 w-4", size }: IconProps) {
  return <Play className={className} size={size} />;
}