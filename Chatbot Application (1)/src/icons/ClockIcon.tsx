import { Clock } from "lucide-react";

interface IconProps {
  className?: string;
  size?: number;
}

export function ClockIcon({ className = "h-4 w-4", size }: IconProps) {
  return <Clock className={className} size={size} />;
}