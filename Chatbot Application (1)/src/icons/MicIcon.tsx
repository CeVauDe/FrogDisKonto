import { Mic } from "lucide-react";

interface IconProps {
  className?: string;
  size?: number;
}

export function MicIcon({ className = "h-4 w-4", size }: IconProps) {
  return <Mic className={className} size={size} />;
}