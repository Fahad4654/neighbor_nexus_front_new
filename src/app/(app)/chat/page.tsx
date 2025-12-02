'use client';

import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { getUserById, User } from "@/lib/data";
import { cn } from "@/lib/utils";
import { Search, Send } from "lucide-react";
import { useUser, useFirestore, useCollection, useMemoFirebase, addDocumentNonBlocking } from "@/firebase";
import { collection, query, orderBy, serverTimestamp } from "firebase/firestore";

function ConversationList({ onSelectConversation, selectedConversationId }: { onSelectConversation: (id: string | null) => void; selectedConversationId: string | null; }) {
    const { user } = useUser();
    const firestore = useFirestore();

    const conversationsQuery = useMemoFirebase(() => {
        if (!user) return null;
        return collection(firestore, 'users', user.uid, 'inboxes');
    }, [firestore, user]);

    const { data: conversations, isLoading } = useCollection(conversationsQuery);
    
    // In a real app, you would fetch the participant's details
    // For now, we use mock data, assuming the other participant is 'u2' for all conversations.
    const otherParticipant = getUserById('u2');

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
                    {isLoading && <p className="p-4 text-sm text-muted-foreground">Loading conversations...</p>}
                    {conversations?.map(convo => {
                        return (
                            <button key={convo.id} 
                                onClick={() => onSelectConversation(convo.id)}
                                className={cn(
                                "flex items-center gap-3 p-2 rounded-lg w-full text-left transition-colors",
                                convo.id === selectedConversationId ? "bg-accent text-accent-foreground" : "hover:bg-muted"
                            )}>
                                <Avatar>
                                    <AvatarImage src={otherParticipant?.avatarUrl} />
                                    <AvatarFallback>{otherParticipant?.name.charAt(0)}</AvatarFallback>
                                </Avatar>
                                <div className="flex-1 truncate">
                                    <p className="font-semibold">{otherParticipant?.name}</p>
                                    {/* <p className="text-sm text-muted-foreground truncate">{convo.lastMessage.content}</p> */}
                                </div>
                                {/* <time className="text-xs text-muted-foreground">
                                    {convo.lastMessage.timestamp ? new Date(convo.lastMessage.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                                </time> */}
                            </button>
                        )
                    })}
                </div>
            </ScrollArea>
        </Card>
    )
}

function ChatWindow({ conversationId }: { conversationId: string | null }) {
    const { user } = useUser();
    const firestore = useFirestore();
    const [newMessage, setNewMessage] = useState('');

    const messagesQuery = useMemoFirebase(() => {
        if (!user || !conversationId) return null;
        return query(collection(firestore, 'users', user.uid, 'inboxes', conversationId, 'messages'), orderBy('sentAt', 'asc'));
    }, [firestore, user, conversationId]);

    const { data: messages, isLoading } = useCollection(messagesQuery);

    const handleSendMessage = () => {
        if (!user || !conversationId || !newMessage.trim()) return;

        const messagesCol = collection(firestore, 'users', user.uid, 'inboxes', conversationId, 'messages');
        
        addDocumentNonBlocking(messagesCol, {
            senderId: user.uid,
            recipientId: 'u2', // This would be dynamic in a real app
            content: newMessage,
            isRead: false,
            sentAt: serverTimestamp(),
        });

        setNewMessage('');
    };
    
    // In a real app, you would fetch the participant's details
    const otherParticipant = getUserById('u2');

    if (!conversationId) {
        return (
            <Card className="h-full flex flex-col items-center justify-center">
                <div className="text-center">
                    <MessageCircle className="h-16 w-16 text-muted-foreground mx-auto" />
                    <h2 className="mt-4 text-xl font-semibold">Select a conversation</h2>
                    <p className="text-muted-foreground mt-1">Choose a conversation from the list to start chatting.</p>
                </div>
            </Card>
        );
    }

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
                    {isLoading && <p>Loading messages...</p>}
                    {messages?.map(msg => {
                        const isSender = msg.senderId === user?.uid;
                        return (
                            <div key={msg.id} className={cn("flex", isSender ? "justify-end" : "justify-start")}>
                                <div className={cn(
                                    "rounded-lg px-4 py-2 max-w-[80%]",
                                    isSender ? "bg-primary text-primary-foreground" : "bg-muted"
                                )}>
                                    <p>{msg.content}</p>
                                    <time className="text-xs opacity-70 mt-1 block text-right">
                                        {msg.sentAt ? new Date(msg.sentAt.toDate()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                                    </time>
                                </div>
                            </div>
                        )
                    })}
                </div>
            </ScrollArea>
            <div className="p-4 border-t">
                <div className="relative">
                    <Input 
                        placeholder="Type a message..." 
                        className="pr-12" 
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                    />
                    <Button type="submit" size="icon" className="absolute top-1/2 right-1.5 -translate-y-1/2 h-7 w-7" onClick={handleSendMessage}>
                        <Send className="h-4 w-4" />
                        <span className="sr-only">Send</span>
                    </Button>
                </div>
            </div>
        </Card>
    )
}

export default function ChatPage() {
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);

  // Automatically select the first conversation if available
    React.useEffect(() => {
        // This is a placeholder. In a real app you might fetch conversations and set the first one.
        // For now, we can't do this easily without knowing the conversation IDs from firestore ahead of time.
        // A user would typically click a conversation to select it.
  }, []);

  return (
    <div className="h-full grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
        <div className="md:col-span-1 lg:col-span-1 h-full hidden md:block">
            <ConversationList onSelectConversation={setSelectedConversationId} selectedConversationId={selectedConversationId} />
        </div>
        <div className="md:col-span-2 lg:col-span-3 h-full">
            <ChatWindow conversationId={selectedConversationId} />
        </div>
    </div>
  );
}
