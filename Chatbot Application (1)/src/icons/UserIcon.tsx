import { User } from "lucide-react";

interface IconProps {
  className?: string;
  size?: number;
}

export function UserIcon({ className = "h-4 w-4", size }: IconProps) {
  return <User className={className} size={size} />;
}