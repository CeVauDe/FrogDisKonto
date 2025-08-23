import { Send } from "lucide-react";

interface IconProps {
  className?: string;
  size?: number;
}

export function SendIcon({ className = "h-4 w-4", size }: IconProps) {
  return <Send className={className} size={size} />;
}