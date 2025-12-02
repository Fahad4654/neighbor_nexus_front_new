import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { getConversationsForUser, getMessagesForConversation, getUserById, User, Conversation } from "@/lib/data";
import { cn } from "@/lib/utils";
import { Search, Send } from "lucide-react";

// For this demo, we'll assume the logged-in user is 'u1'
const LOGGED_IN_USER_ID = 'u1';

function ConversationList() {
    const conversations = getConversationsForUser(LOGGED_IN_USER_ID);

    return (
        <Card className="h-full flex flex-col">
            <div className="p-4 border-b">
                <h2 className="text-xl font-bold">Messages</h2>
                 <div className="relative mt-2">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input placeholder="Search messages..." className="pl-8" />
                </div>
            </div>
            <ScrollArea className="flex-1">
                <div className="p-2 space-y-1">
                    {conversations.map(convo => {
                        const otherParticipant = getUserById(convo.participantIds.find(id => id !== LOGGED_IN_USER_ID)!);
                        return (
                            <button key={convo.id} className={cn(
                                "flex items-center gap-3 p-2 rounded-lg w-full text-left transition-colors",
                                convo.id === 'c1' ? "bg-accent text-accent-foreground" : "hover:bg-muted"
                            )}>
                                <Avatar>
                                    <AvatarImage src={otherParticipant?.avatarUrl} />
                                    <AvatarFallback>{otherParticipant?.name.charAt(0)}</AvatarFallback>
                                </Avatar>
                                <div className="flex-1 truncate">
                                    <p className="font-semibold">{otherParticipant?.name}</p>
                                    <p className="text-sm text-muted-foreground truncate">{convo.lastMessage.content}</p>
                                </div>
                                <time className="text-xs text-muted-foreground">
                                    {new Date(convo.lastMessage.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </time>
                            </button>
                        )
                    })}
                </div>
            </ScrollArea>
        </Card>
    )
}

function ChatWindow() {
    const messages = getMessagesForConversation('c1');
    const conversation = getConversationsForUser(LOGGED_IN_USER_ID).find(c => c.id === 'c1')!;
    const otherParticipant = getUserById(conversation.participantIds.find(id => id !== LOGGED_IN_USER_ID)!);

    return (
        <Card className="h-full flex flex-col">
            <div className="p-4 border-b flex items-center gap-3">
                 <Avatar>
                    <AvatarImage src={otherParticipant?.avatarUrl} />
                    <AvatarFallback>{otherParticipant?.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <h2 className="text-xl font-bold">{otherParticipant?.name}</h2>
            </div>
            <ScrollArea className="flex-1 p-4">
                <div className="space-y-4">
                    {messages.map(msg => {
                        const isSender = msg.senderId === LOGGED_IN_USER_ID;
                        return (
                            <div key={msg.id} className={cn("flex", isSender ? "justify-end" : "justify-start")}>
                                <div className={cn(
                                    "rounded-lg px-4 py-2 max-w-[80%]",
                                    isSender ? "bg-primary text-primary-foreground" : "bg-muted"
                                )}>
                                    <p>{msg.content}</p>
                                    <time className="text-xs opacity-70 mt-1 block text-right">
                                        {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </time>
                                </div>
                            </div>
                        )
                    })}
                </div>
            </ScrollArea>
            <div className="p-4 border-t">
                <div className="relative">
                    <Input placeholder="Type a message..." className="pr-12" />
                    <Button type="submit" size="icon" className="absolute top-1/2 right-1.5 -translate-y-1/2 h-7 w-7">
                        <Send className="h-4 w-4" />
                        <span className="sr-only">Send</span>
                    </Button>
                </div>
            </div>
        </Card>
    )
}

export default function ChatPage() {
  return (
    <div className="h-full grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
        <div className="md:col-span-1 lg:col-span-1 h-full hidden md:block">
            <ConversationList />
        </div>
        <div className="md:col-span-2 lg:col-span-3 h-full">
            <ChatWindow />
        </div>
    </div>
  );
}
