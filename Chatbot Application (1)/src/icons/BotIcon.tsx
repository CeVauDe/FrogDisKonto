import { Bot } from "lucide-react";

interface IconProps {
  className?: string;
  size?: number;
}

export function BotIcon({ className = "h-4 w-4", size }: IconProps) {
  return <Bot className={className} size={size} />;
}