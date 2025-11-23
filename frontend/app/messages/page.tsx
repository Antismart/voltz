'use client';

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Send, Search, MoreVertical, Paperclip, MessageSquare } from 'lucide-react';
import { motion } from 'framer-motion';
import DashboardLayout from '../dashboard/layout';
import { useAuth } from '@/lib/hooks/useAuth';

const mockConversations = [
  {
    id: '1',
    participant: {
      id: '1',
      name: 'Sarah Chen',
      avatar: null,
      role: 'Full Stack Developer',
      online: true,
    },
    lastMessage: {
      content: 'That sounds great! Looking forward to meeting at ETHGlobal',
      sentAt: '5m ago',
      read: true,
    },
    unreadCount: 0,
  },
  {
    id: '2',
    participant: {
      id: '2',
      name: 'Alex Rodriguez',
      avatar: null,
      role: 'Smart Contract Engineer',
      online: false,
    },
    lastMessage: {
      content: 'Have you checked out the new ZK library?',
      sentAt: '1h ago',
      read: false,
    },
    unreadCount: 2,
  },
  {
    id: '3',
    participant: {
      id: '3',
      name: 'Maya Patel',
      avatar: null,
      role: 'Product Manager',
      online: true,
    },
    lastMessage: {
      content: 'Thanks for the intro!',
      sentAt: '3h ago',
      read: true,
    },
    unreadCount: 0,
  },
];

const mockMessages = [
  {
    id: '1',
    senderId: '1',
    content: 'Hey! I saw we both registered for ETHGlobal SF',
    sentAt: '10:30 AM',
    read: true,
  },
  {
    id: '2',
    senderId: 'me',
    content: 'Yes! Looking forward to it. Are you interested in collaborating?',
    sentAt: '10:32 AM',
    read: true,
  },
  {
    id: '3',
    senderId: '1',
    content:
      'Definitely! I saw you have experience with ZK proofs. I\'m working on a privacy-focused DeFi project.',
    sentAt: '10:35 AM',
    read: true,
  },
  {
    id: '4',
    senderId: 'me',
    content:
      'That sounds really interesting! I\'d love to hear more about it. Maybe we can grab coffee during the event?',
    sentAt: '10:38 AM',
    read: true,
  },
  {
    id: '5',
    senderId: '1',
    content: 'That sounds great! Looking forward to meeting at ETHGlobal',
    sentAt: '10:40 AM',
    read: true,
  },
];

export default function MessagesPage() {
  const { isAuthenticated } = useAuth();
  const [selectedConversation, setSelectedConversation] = useState(
    mockConversations[0]
  );
  const [messageInput, setMessageInput] = useState('');

  const handleSendMessage = () => {
    if (messageInput.trim()) {
      // Handle sending message
      setMessageInput('');
    }
  };

  // XMTP Integration Notice
  if (!isAuthenticated) {
    return (
      <DashboardLayout>
        <Card className="p-12">
          <div className="text-center">
            <MessageSquare className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Connect Wallet to Message</h3>
            <p className="text-sm text-muted-foreground">
              Sign in to access encrypted messaging
            </p>
          </div>
        </Card>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="h-[calc(100vh-8rem)] md:h-[calc(100vh-12rem)]">
        <Card className="h-full overflow-hidden">
          <div className="grid h-full grid-cols-1 lg:grid-cols-[300px,1fr] xl:grid-cols-[350px,1fr]">
            {/* Conversations List */}
            <div className="flex flex-col border-r hidden lg:flex">
              {/* Search */}
              <div className="border-b p-3 md:p-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-3 w-3 md:h-4 md:w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Search conversations..."
                    className="pl-9 md:pl-10 text-sm"
                  />
                </div>
                <Badge variant="secondary" className="mt-2 text-xs">
                  XMTP Integration Pending
                </Badge>
              </div>

              {/* Conversations */}
              <div className="flex-1 overflow-y-auto">
                {mockConversations.map((conversation) => (
                  <motion.div
                    key={conversation.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className={`cursor-pointer border-b p-3 md:p-4 transition-colors ${
                      selectedConversation.id === conversation.id
                        ? 'bg-accent'
                        : 'hover:bg-accent/50'
                    }`}
                    onClick={() => setSelectedConversation(conversation)}
                  >
                    <div className="flex items-start gap-3">
                      <div className="relative">
                        <Avatar className="h-12 w-12">
                          <AvatarImage src={conversation.participant.avatar || ''} />
                          <AvatarFallback className="bg-gradient-to-br from-purple-500 to-blue-500 text-white">
                            {conversation.participant.name[0]}
                          </AvatarFallback>
                        </Avatar>
                        {conversation.participant.online && (
                          <div className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-background bg-green-500" />
                        )}
                      </div>

                      <div className="flex-1 overflow-hidden">
                        <div className="flex items-start justify-between">
                          <div className="flex-1 overflow-hidden">
                            <h4 className="font-semibold truncate">
                              {conversation.participant.name}
                            </h4>
                            <p className="text-xs text-muted-foreground truncate">
                              {conversation.participant.role}
                            </p>
                          </div>
                          <div className="ml-2 flex flex-col items-end gap-1">
                            <span className="text-xs text-muted-foreground whitespace-nowrap">
                              {conversation.lastMessage.sentAt}
                            </span>
                            {conversation.unreadCount > 0 && (
                              <Badge variant="default" className="h-5 px-2">
                                {conversation.unreadCount}
                              </Badge>
                            )}
                          </div>
                        </div>
                        <p
                          className={`mt-1 text-sm truncate ${
                            !conversation.lastMessage.read
                              ? 'font-semibold'
                              : 'text-muted-foreground'
                          }`}
                        >
                          {conversation.lastMessage.content}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Chat Area */}
            <div className="flex flex-col">
              {/* Chat Header */}
              <div className="flex items-center justify-between border-b p-3 md:p-4">
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarImage
                      src={selectedConversation.participant.avatar || ''}
                    />
                    <AvatarFallback className="bg-gradient-to-br from-purple-500 to-blue-500 text-white">
                      {selectedConversation.participant.name[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h4 className="font-semibold">
                      {selectedConversation.participant.name}
                    </h4>
                    <p className="text-xs text-muted-foreground">
                      {selectedConversation.participant.online
                        ? 'Online'
                        : 'Offline'}
                    </p>
                  </div>
                </div>
                <Button variant="ghost" size="icon">
                  <MoreVertical className="h-5 w-5" />
                </Button>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-3 md:p-4 space-y-3 md:space-y-4">
                {mockMessages.map((message, index) => {
                  const isMe = message.senderId === 'me';
                  return (
                    <motion.div
                      key={message.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[70%] rounded-2xl px-4 py-2 ${
                          isMe
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-muted'
                        }`}
                      >
                        <p className="text-sm">{message.content}</p>
                        <p
                          className={`mt-1 text-xs ${
                            isMe
                              ? 'text-primary-foreground/70'
                              : 'text-muted-foreground'
                          }`}
                        >
                          {message.sentAt}
                        </p>
                      </div>
                    </motion.div>
                  );
                })}
              </div>

              {/* Message Input */}
              <div className="border-t p-3 md:p-4">
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="icon">
                    <Paperclip className="h-5 w-5" />
                  </Button>
                  <Input
                    placeholder="Type a message..."
                    value={messageInput}
                    onChange={(e) => setMessageInput(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        handleSendMessage();
                      }
                    }}
                    className="flex-1"
                  />
                  <Button
                    variant="gradient"
                    size="icon"
                    onClick={handleSendMessage}
                    disabled={!messageInput.trim()}
                  >
                    <Send className="h-5 w-5" />
                  </Button>
                </div>
                <p className="mt-2 text-xs text-muted-foreground text-center hidden md:block">
                  End-to-end encrypted messaging with XMTP
                </p>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
}
