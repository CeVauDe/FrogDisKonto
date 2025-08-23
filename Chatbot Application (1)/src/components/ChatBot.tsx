import { useState, useRef, useEffect } from "react";
import { ChatMessage } from "./ChatMessage";
import { ChatInput } from "./ChatInput";
import { ScrollArea } from "./ui/scroll-area";
import { Card } from "./ui/card";
import Rectangle1 from "../imports/Rectangle1";

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
  contentType?: 'text' | 'video' | 'podcast' | 'comic';
  videoUrl?: string;
  videoTitle?: string;
  podcastUrl?: string;
  podcastTitle?: string;
  podcastDuration?: string;
}

const mockResponses = [
  "Basierend auf deinen Ausgabendaten vom letzten Monat sehe ich tatsächlich eine Verbesserung! Du hast 12% weniger für Restaurants ausgegeben und deine Lebensmittelkosten um 8% reduziert. Soll ich dir eine detaillierte Analyse als Podcast erstellen?",
  "Ja, definitiv! Deine Ausgaben für Transport sind um 15% gesunken. Das entspricht einer Ersparnis von CHF 89. Möchtest du, dass ich dir das als Rapsong zusammenfasse?",
  "Interessante Frage! Lass mich deine Ausgabenmuster analysieren... Ich sehe positive Trends bei deinen Fixkosten. Soll ich dir ein Comic dazu erstellen?",
  "Großartig, dass du deine Finanzen reflektierst! Deine Ausgaben für Online-Shopping sind deutlich gesunken. Welches Format bevorzugst du für die Analyse?",
  "Ich kann eine Verbesserung bei deinen variablen Ausgaben feststellen. 18% weniger Impulskäufe als letzten Monat! Soll ich dir das als Podcast erklären?",
  "Deine Budgetdisziplin zahlt sich aus! Die Ausgaben für Unterhaltung sind im Rahmen geblieben. Möchtest du einen Rapsong über deine Erfolge?",
  "Absolut! Besonders bei den Nebenkategorien sehe ich Verbesserungen. Soll ich dir ein Comic mit deinen Top 3 Sparerfolgen erstellen?",
];

const videoResponse = {
  text: "Hier ist deine detaillierte Finanzanalyse als Video! Ich zeige dir deine wichtigsten Ausgabentrends der letzten 3 Monate und gebe dir konkrete Spartipps basierend auf deinem Ausgabeverhalten.",
  contentType: 'video' as const,
  videoUrl: 'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4',
  videoTitle: 'Deine persönliche Finanzanalyse - März 2024'
};

const podcastResponse = {
  text: "Hier ist deine persönliche Finanzanalyse als Podcast! Ich erkläre dir ausführlich deine Ausgabentrends, zeige dir versteckte Sparpotentiale auf und gebe dir praktische Tipps für deinen Alltag.",
  contentType: 'podcast' as const,
  podcastUrl: 'https://example.com/podcast.mp3',
  podcastTitle: 'Deine Finanzanalyse: Erfolge & Sparpotentiale',
  podcastDuration: '8:32'
};

export function ChatBot() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      text: "Willkommen bei PostFinance. Ich helfe dir deine Finanzen besser zu verstehen. Wenn du willst kann ich dir auch mit einem Podcast, Video, einem Rapsong oder einem Comic antworten.",
      isUser: false,
      timestamp: new Date(),
    },
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    if (scrollAreaRef.current) {
      const scrollContainer = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight;
      }
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (messageText: string) => {
    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      text: messageText,
      isUser: true,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setIsTyping(true);

    // Simulate bot response delay
    setTimeout(() => {
      let responseData;
      
      // Check message content for specific format requests
      const lowerMessage = messageText.toLowerCase();
      
      if (lowerMessage.includes('podcast') || 
          lowerMessage.includes('audio') ||
          lowerMessage.includes('hören')) {
        responseData = podcastResponse;
      } else if (lowerMessage.includes('video') || 
                 lowerMessage.includes('analyse') ||
                 lowerMessage.includes('trends')) {
        responseData = videoResponse;
      } else {
        responseData = mockResponses[Math.floor(Math.random() * mockResponses.length)];
      }
      
      let botMessage: Message;
      
      if (typeof responseData === 'string') {
        botMessage = {
          id: (Date.now() + 1).toString(),
          text: responseData,
          isUser: false,
          timestamp: new Date(),
        };
      } else {
        botMessage = {
          id: (Date.now() + 1).toString(),
          text: responseData.text,
          isUser: false,
          timestamp: new Date(),
          contentType: responseData.contentType,
          ...(responseData.contentType === 'video' && {
            videoUrl: responseData.videoUrl,
            videoTitle: responseData.videoTitle,
          }),
          ...(responseData.contentType === 'podcast' && {
            podcastUrl: responseData.podcastUrl,
            podcastTitle: responseData.podcastTitle,
            podcastDuration: responseData.podcastDuration,
          }),
        };
      }

      setMessages(prev => [...prev, botMessage]);
      setIsTyping(false);
    }, 1000 + Math.random() * 2000);
  };

  return (
    <div className="flex flex-col h-screen w-full max-w-2xl mx-auto">
      <div className="sticky top-0 z-10 p-4 border-b bg-card">
        <div className="flex items-center gap-3">
          <div className="flex-1 pl-2.5">
            <h2 className="font-medium">PostFinance SpendCast</h2>
            <p className="text-sm text-muted-foreground">Rede mit deinen Finanzen.</p>
          </div>
          <div className="w-10 h-10 flex-shrink-0">
            <Rectangle1 />
          </div>
        </div>
      </div>

      <ScrollArea ref={scrollAreaRef} className="flex-1 p-4">
        <div className="space-y-4">
          {messages.map((message) => (
            <ChatMessage
              key={message.id}
              message={message.text}
              isUser={message.isUser}
              timestamp={message.timestamp}
              contentType={message.contentType}
              videoUrl={message.videoUrl}
              videoTitle={message.videoTitle}
              podcastUrl={message.podcastUrl}
              podcastTitle={message.podcastTitle}
              podcastDuration={message.podcastDuration}
            />
          ))}
          
          {isTyping && (
            <div className="flex gap-3 justify-start mb-4">
              <div className="bg-muted text-muted-foreground px-4 py-2 rounded-2xl">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-current rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                  <div className="w-2 h-2 bg-current rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                  <div className="w-2 h-2 bg-current rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                </div>
              </div>
            </div>
          )}
        </div>
      </ScrollArea>

      <ChatInput onSendMessage={handleSendMessage} disabled={isTyping} />
    </div>
  );
}