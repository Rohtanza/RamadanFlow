import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';

const ChatContext = createContext();

export const useChat = () => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
};

export const ChatProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [messages, setMessages] = useState([]);
  const [typingUsers, setTypingUsers] = useState(new Set());
  const [onlineUsers, setOnlineUsers] = useState(new Set());
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      const newSocket = io(import.meta.env.VITE_API_URL, {
        withCredentials: true
      });

      newSocket.on('connect', () => {
        console.log('Connected to chat server');
        newSocket.emit('join', user._id);
      });

      newSocket.on('newMessage', (message) => {
        setMessages(prev => [...prev, message]);
      });

      newSocket.on('userTyping', ({ userId, isTyping }) => {
        setTypingUsers(prev => {
          const newSet = new Set(prev);
          if (isTyping) {
            newSet.add(userId);
          } else {
            newSet.delete(userId);
          }
          return newSet;
        });
      });

      newSocket.on('userJoined', (userId) => {
        setOnlineUsers(prev => new Set([...prev, userId]));
      });

      newSocket.on('userLeft', (userId) => {
        setOnlineUsers(prev => {
          const newSet = new Set(prev);
          newSet.delete(userId);
          return newSet;
        });
      });

      setSocket(newSocket);

      return () => {
        newSocket.disconnect();
      };
    }
  }, [user]);

  const sendMessage = (content) => {
    if (socket && user) {
      socket.emit('sendMessage', {
        userId: user._id,
        message: content
      });
    }
  };

  const setTyping = (isTyping) => {
    if (socket && user) {
      socket.emit('typing', {
        userId: user._id,
        isTyping
      });
    }
  };

  const value = {
    messages,
    sendMessage,
    setTyping,
    typingUsers,
    onlineUsers
  };

  return (
    <ChatContext.Provider value={value}>
      {children}
    </ChatContext.Provider>
  );
}; 