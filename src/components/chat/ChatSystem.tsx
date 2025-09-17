import React, { useState, useEffect, useRef } from 'react';
import { Send, Paperclip, Smile, Phone, Video, MoreVertical, X } from 'lucide-react';
import { useStore } from '../../store/useStore';
import { db } from '../../lib/supabase';
import { Button } from '../ui/Button';

interface Message {
  id: string;
  session_id: string;
  sender_id: string;
  message: string;
  message_type: 'text' | 'image' | 'file';
  file_url?: string;
  created_at: string;
  sender?: {
    full_name: string;
    email: string;
  };
}

interface ChatSession {
  id: string;
  user_id: string;
  admin_id?: string;
  status: 'active' | 'closed' | 'waiting';
  subject?: string;
  created_at: string;
  user?: {
    full_name: string;
    email: string;
  };
}

interface ChatSystemProps {
  onClose?: () => void;
}

export const ChatSystem: React.FC<ChatSystemProps> = ({ onClose }) => {
  const { user, language, isAdmin } = useStore();
  const [messages, setMessages] = useState<Message[]>([]);
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [currentSession, setCurrentSession] = useState<ChatSession | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [error, setError] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const translations = {
    en: {
      chat: 'Chat Support',
      typeMessage: 'Type your message...',
      send: 'Send',
      startChat: 'Start New Chat',
      noMessages: 'No messages yet',
      online: 'Online',
      offline: 'Offline',
      minimize: 'Minimize',
      close: 'Close',
      allChats: 'All Chats',
      newChat: 'New Chat',
      you: 'You',
      admin: 'Admin',
      support: 'Support Team',
    },
    fr: {
      chat: 'Support Chat',
      typeMessage: 'Tapez votre message...',
      send: 'Envoyer',
      startChat: 'Nouveau Chat',
      noMessages: 'Aucun message',
      online: 'En ligne',
      offline: 'Hors ligne',
      minimize: 'Réduire',
      close: 'Fermer',
      allChats: 'Tous les Chats',
      newChat: 'Nouveau Chat',
      you: 'Vous',
      admin: 'Admin',
      support: 'Équipe Support',
    }
  };

  const t = translations[language];

  useEffect(() => {
    if (user) {
      loadChatData();
    }
  }, [user, isAdmin]);

  useEffect(() => {
    if (currentSession) {
      loadMessages(currentSession.id);
    }
  }, [currentSession]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const loadChatData = async () => {
    try {
      setError('');
      if (isAdmin()) {
        // Admin sees all chat sessions
        const { data: allSessions } = await db.getAllChatSessions();
        if (allSessions) {
          setSessions(
            allSessions.map(s => ({
              ...s,
              status: s.status as 'active' | 'closed' | 'waiting'
            }))
          );
        }
      } else {
        // User sees only their sessions
        const { data: userSessions } = await db.getUserChatSessions(user!.id);
        if (userSessions) {
          setSessions(
            userSessions.map(s => ({
              ...s,
              status: s.status as 'active' | 'closed' | 'waiting'
            }))
          );
          // Auto-select the first active session or create new one
          if (userSessions.length === 0) {
            await createNewSession();
          } else {
            setCurrentSession(
              {
                ...userSessions[0],
                status: userSessions[0].status as 'active' | 'closed' | 'waiting'
              }
            );
          }
        }
      }
    } catch (error) {
      console.error('Error loading chat data:', error);
      setError('Failed to load chat data');
    }
  };

  const loadMessages = async (sessionId: string) => {
    try {
      setError('');
      const { data: sessionMessages } = await db.getChatMessages(sessionId);
      if (sessionMessages) {
        setMessages(
          sessionMessages.map((msg: any) => ({
            ...msg,
            message_type: msg.message_type as 'text' | 'image' | 'file'
          }))
        );
      }
    } catch (error) {
      console.error('Error loading messages:', error);
      setError('Failed to load messages');
    }
  };

  const createNewSession = async () => {
    if (!user) return;

    try {
      setError('');
      const sessionData = {
        user_id: user.id,
        status: 'active',
        subject: 'General Support',
      };

      const { data: newSession } = await db.createChatSession(sessionData);
      if (newSession) {
        setCurrentSession(newSession);
        setSessions(prev => [newSession, ...prev]);
      }
    } catch (error) {
      console.error('Error creating chat session:', error);
      setError('Failed to create chat session');
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !currentSession || !user) return;

    setLoading(true);
    setError('');
    try {
      const messageData = {
        session_id: currentSession.id,
        sender_id: user.id,
        message: newMessage.trim(),
        message_type: 'text',
      };

      const { data: sentMessage } = await db.sendChatMessage(messageData);
      if (sentMessage) {
        setMessages(prev => [...prev, sentMessage]);
        setNewMessage('');
        
        // Update session timestamp
        await db.updateChatSession(currentSession.id, {
          updated_at: new Date().toISOString()
        });
      }
    } catch (error) {
      console.error('Error sending message:', error);
      setError('Failed to send message');
    } finally {
      setLoading(false);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  if (isMinimized) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <Button
          onClick={() => setIsMinimized(false)}
          className="bg-blue-600 hover:bg-blue-700 text-white rounded-full p-4 shadow-lg"
        >
          💬 {sessions.filter(s => s.status === 'active').length}
        </Button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 w-96 h-96 bg-white rounded-lg shadow-2xl border border-gray-200 flex flex-col">
      {/* Header */}
      <div className="bg-blue-600 text-white p-4 rounded-t-lg flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-green-400 rounded-full"></div>
          <h3 className="font-semibold">{t.chat}</h3>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsMinimized(true)}
            className="text-white hover:bg-blue-700 p-1"
          >
            <MoreVertical className="w-4 h-4" />
          </Button>
          {onClose && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="text-white hover:bg-blue-700 p-1"
            >
              <X className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Chat Sessions (Admin View) */}
      {isAdmin() && !currentSession && (
        <div className="flex-1 overflow-y-auto p-4">
          <h4 className="font-semibold mb-4">{t.allChats}</h4>
          <div className="space-y-2">
            {sessions.map(session => (
              <div
                key={session.id}
                onClick={() => setCurrentSession(session)}
                className="p-3 border rounded-lg cursor-pointer hover:bg-gray-50"
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium">
                    {session.user?.full_name || 'User'}
                  </span>
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    session.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                  }`}>
                    {session.status}
                  </span>
                </div>
                <p className="text-sm text-gray-600 mt-1">
                  {session.subject || 'General Support'}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Messages */}
      {currentSession && (
        <>
          {error && (
            <div className="p-3 bg-red-50 border-b border-red-200">
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}
          
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.length === 0 ? (
              <div className="text-center text-gray-500 py-8">
                <p>{t.noMessages}</p>
                <p className="text-sm mt-2">Start the conversation!</p>
              </div>
            ) : 
              messages.map(message => (
                <div
                  key={message.id}
                  className={`flex ${message.sender_id === user?.id ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-xs px-4 py-2 rounded-lg ${
                      message.sender_id === user?.id
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-900'
                    }`}
                  >
                    <p className="text-sm">{message.message}</p>
                    <p className={`text-xs mt-1 ${
                      message.sender_id === user?.id ? 'text-blue-100' : 'text-gray-500'
                    }`}>
                      {new Date(message.created_at).toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              ))
            }
            <div ref={messagesEndRef} />
          </div>

          {/* Message Input */}
          <div className="p-4 border-t border-gray-200">
            <div className="flex items-center space-x-2">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={t.typeMessage}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={loading}
              />
              <Button
                onClick={sendMessage}
                disabled={loading || !newMessage.trim()}
                className="bg-blue-600 hover:bg-blue-700 text-white p-2"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </>
      )}

      {/* Start New Chat (User View) */}
      {!isAdmin() && !currentSession && (
        <div className="flex-1 flex items-center justify-center p-4">
          <Button
            onClick={createNewSession}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            {t.startChat}
          </Button>
        </div>
      )}
    </div>
  );
};