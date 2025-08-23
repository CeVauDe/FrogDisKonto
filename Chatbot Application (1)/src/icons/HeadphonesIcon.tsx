import { Headphones } from "lucide-react";

interface IconProps {
  className?: string;
  size?: number;
}

export function HeadphonesIcon({ className = "h-4 w-4", size }: IconProps) {
  return <Headphones className={className} size={size} />;
}