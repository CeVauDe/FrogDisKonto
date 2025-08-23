import { Avatar, AvatarFallback } from "./ui/avatar";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { BotIcon } from "../icons/BotIcon";
import { UserIcon } from "../icons/UserIcon";
import { PlayIcon } from "../icons/PlayIcon";
import { VideoIcon } from "../icons/VideoIcon";
import { MicIcon } from "../icons/MicIcon";
import { ClockIcon } from "../icons/ClockIcon";
import { HeadphonesIcon } from "../icons/HeadphonesIcon";

interface ChatMessageProps {
  message: string;
  isUser: boolean;
  timestamp: Date;
  contentType?: 'text' | 'video' | 'podcast' | 'comic';
  videoUrl?: string;
  videoTitle?: string;
  podcastUrl?: string;
  podcastTitle?: string;
  podcastDuration?: string;
}

export function ChatMessage({ 
  message, 
  isUser, 
  timestamp, 
  contentType = 'text',
  videoUrl,
  videoTitle,
  podcastUrl,
  podcastTitle,
  podcastDuration 
}: ChatMessageProps) {
  const renderVideoContent = () => {
    if (contentType !== 'video') return null;

    return (
      <Card className="mt-3 p-0 overflow-hidden border border-border bg-card max-w-md">
        <div className="relative bg-gradient-to-br from-primary/20 to-primary/5 aspect-video flex items-center justify-center">
          <div className="absolute inset-0 bg-black/10 flex items-center justify-center">
            <Button 
              size="lg" 
              className="rounded-full bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg"
            >
              <PlayIcon className="h-6 w-6 ml-1" />
            </Button>
          </div>
          <div className="absolute top-3 left-3 bg-black/60 text-white px-2 py-1 rounded text-xs flex items-center gap-1">
            <VideoIcon className="h-3 w-3" />
            3:45
          </div>
        </div>
        <div className="p-4">
          <h4 className="font-medium text-sm mb-2">{videoTitle}</h4>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center">
              <BotIcon className="h-3 w-3 text-primary-foreground" />
            </div>
            <span>PostFinance SpendCast</span>
            <span>•</span>
            <span>Heute erstellt</span>
          </div>
          <div className="mt-3 flex flex-wrap gap-1">
            <span className="inline-block bg-primary/10 text-primary px-2 py-1 rounded text-xs">Ausgabenanalyse</span>
            <span className="inline-block bg-primary/10 text-primary px-2 py-1 rounded text-xs">Spartipps</span>
            <span className="inline-block bg-primary/10 text-primary px-2 py-1 rounded text-xs">Personalisiert</span>
          </div>
        </div>
      </Card>
    );
  };

  const renderPodcastContent = () => {
    if (contentType !== 'podcast') return null;

    return (
      <Card className="mt-3 p-0 overflow-hidden border border-border bg-card max-w-md">
        <div className="relative bg-gradient-to-br from-primary/20 to-primary/5 p-6 flex items-center justify-center">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent"></div>
          <div className="relative z-10 flex flex-col items-center text-center">
            <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mb-4 shadow-lg">
              <HeadphonesIcon className="h-8 w-8 text-primary-foreground" />
            </div>
            <Button 
              size="lg" 
              className="rounded-full bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg"
            >
              <PlayIcon className="h-5 w-5 mr-2" />
              Abspielen
            </Button>
          </div>
          <div className="absolute top-3 right-3 bg-black/60 text-white px-2 py-1 rounded text-xs flex items-center gap-1">
            <ClockIcon className="h-3 w-3" />
            {podcastDuration}
          </div>
        </div>
        <div className="p-4">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
              <MicIcon className="h-4 w-4 text-primary-foreground" />
            </div>
            <div>
              <h4 className="font-medium text-sm">{podcastTitle}</h4>
              <p className="text-xs text-muted-foreground">PostFinance SpendCast</p>
            </div>
          </div>
          
          <div className="mb-3">
            <div className="w-full bg-muted rounded-full h-1.5">
              <div className="bg-primary h-1.5 rounded-full w-0"></div>
            </div>
            <div className="flex justify-between text-xs text-muted-foreground mt-1">
              <span>0:00</span>
              <span>{podcastDuration}</span>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs text-muted-foreground mb-3">
            <div className="w-5 h-5 bg-primary rounded-full flex items-center justify-center">
              <BotIcon className="h-3 w-3 text-primary-foreground" />
            </div>
            <span>Heute erstellt</span>
            <span>•</span>
            <span>Finanzanalyse</span>
          </div>
          
          <div className="flex flex-wrap gap-1">
            <span className="inline-block bg-primary/10 text-primary px-2 py-1 rounded text-xs">Audio</span>
            <span className="inline-block bg-primary/10 text-primary px-2 py-1 rounded text-xs">Budgetberatung</span>
            <span className="inline-block bg-primary/10 text-primary px-2 py-1 rounded text-xs">Personalisiert</span>
          </div>
        </div>
      </Card>
    );
  };

  return (
    <div className={`flex gap-3 ${isUser ? 'justify-end' : 'justify-start'} mb-4`}>
      {!isUser && (
        <Avatar className="h-8 w-8 mt-1">
          <AvatarFallback className="bg-primary text-primary-foreground">
            <BotIcon className="h-4 w-4" />
          </AvatarFallback>
        </Avatar>
      )}
      
      <div className={`flex flex-col max-w-[70%] ${isUser ? 'items-end' : 'items-start'}`}>
        <div
          className={`px-4 py-2 rounded-2xl ${
            isUser
              ? 'bg-primary text-primary-foreground'
              : 'bg-muted text-muted-foreground'
          }`}
        >
          <p className="break-words">{message}</p>
        </div>
        
        {renderVideoContent()}
        {renderPodcastContent()}
        
        <span className="text-xs text-muted-foreground mt-1 px-2">
          {timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </span>
      </div>

      {isUser && (
        <Avatar className="h-8 w-8 mt-1">
          <AvatarFallback className="bg-secondary text-secondary-foreground">
            <UserIcon className="h-4 w-4" />
          </AvatarFallback>
        </Avatar>
      )}
    </div>
  );
}