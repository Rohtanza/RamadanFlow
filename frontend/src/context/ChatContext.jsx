import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';
import { playNotificationSound } from '../utils/notificationSound';

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
  const [notifications, setNotifications] = useState([]);
  const { user } = useAuth();

  const addNotification = (notification, type = 'success') => {
    console.log('Adding notification:', { notification, type });
    const id = Date.now();
    const notificationData = typeof notification === 'string' 
      ? { id, message: notification, type }
      : { id, ...notification };
    
    console.log('Notification data:', notificationData);
    setNotifications(prev => {
      const newNotifications = [...prev, notificationData];
      console.log('Updated notifications:', newNotifications);
      return newNotifications;
    });
    
    // Play notification sound
    playNotificationSound();
    
    // Auto remove notification after 5 seconds
    setTimeout(() => {
      console.log('Removing notification:', id);
      removeNotification(id);
    }, 5000);
  };

  const removeNotification = (id) => {
    console.log('Removing notification:', id);
    setNotifications(prev => {
      const newNotifications = prev.filter(notification => notification.id !== id);
      console.log('Updated notifications after removal:', newNotifications);
      return newNotifications;
    });
  };

  useEffect(() => {
    if (user) {
      console.log('User data in ChatContext:', user);
      const socketUrl = import.meta.env.VITE_API_URL.replace('/api', '');
      console.log('Connecting to WebSocket server at:', socketUrl);
      
      const newSocket = io(socketUrl, {
        withCredentials: true,
        transports: ['websocket', 'polling'],
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
        timeout: 10000,
        auth: {
          token: localStorage.getItem('token')
        }
      });

      newSocket.on('connect_error', (error) => {
        console.error('Socket connection error:', error);
        addNotification({
          title: 'Connection Error',
          message: `Failed to connect to chat server: ${error.message}. Please try again.`,
          type: 'error'
        });
      });

      newSocket.on('error', (error) => {
        console.error('Socket error:', error);
        addNotification({
          title: 'Error',
          message: error.message || 'An error occurred',
          type: 'error'
        });
      });

      newSocket.on('connect', () => {
        console.log('Connected to chat server');
        addNotification({
          title: 'Connected',
          message: 'Successfully connected to chat server',
          type: 'success'
        });
        newSocket.emit('join', user._id);
      });

      newSocket.on('loadMessages', (loadedMessages) => {
        console.log('Loading existing messages:', loadedMessages);
        setMessages(loadedMessages);
      });

      newSocket.on('newMessage', (message) => {
        console.log('New message received:', message);
        setMessages(prev => [message, ...prev]);
        if (message.sender !== user._id) {
          console.log('Adding notification for new message');
          addNotification({
            title: 'New Post',
            message: `${message.senderName} created a new post`,
            type: 'info'
          });
        }
      });

      newSocket.on('messageLiked', ({ messageId, userId, userName }) => {
        console.log('Message liked event received:', { messageId, userId, userName });
        setMessages(prev => prev.map(msg => {
          if (msg._id === messageId) {
            return {
              ...msg,
              likes: [...(msg.likes || []), userId]
            };
          }
          return msg;
        }));
        if (userId !== user._id) {
          console.log('Adding notification for like');
          addNotification({
            title: 'Post Liked',
            message: `${userName} liked your post`,
            type: 'success'
          });
        }
      });

      newSocket.on('messageDisliked', ({ messageId, userId, userName }) => {
        console.log('Message disliked event received:', { messageId, userId, userName });
        setMessages(prev => prev.map(msg => {
          if (msg._id === messageId) {
            return {
              ...msg,
              dislikes: [...(msg.dislikes || []), userId]
            };
          }
          return msg;
        }));
        if (userId !== user._id) {
          console.log('Adding notification for dislike');
          addNotification({
            title: 'Post Disliked',
            message: `${userName} disliked your post`,
            type: 'warning'
          });
        }
      });

      newSocket.on('newComment', ({ messageId, comment }) => {
        console.log('New comment event received:', { messageId, comment });
        setMessages(prev => prev.map(msg => {
          if (msg._id === messageId) {
            return {
              ...msg,
              comments: [...(msg.comments || []), comment]
            };
          }
          return msg;
        }));
        if (comment.sender !== user._id) {
          console.log('Adding notification for comment');
          addNotification({
            title: 'New Comment',
            message: `${comment.senderName} commented on your post`,
            type: 'info'
          });
        }
      });

      newSocket.on('replyAdded', (data) => {
        console.log('Reply added:', data);
        setMessages(prevMessages => 
          prevMessages.map(msg => {
            if (msg._id === data.messageId) {
              return {
                ...msg,
                comments: msg.comments.map(comment => {
                  if (comment._id === data.commentId) {
                    return {
                      ...comment,
                      replies: [...(comment.replies || []), data.reply]
                    };
                  }
                  return comment;
                })
              };
            }
            return msg;
          })
        );
        addNotification({
          title: 'Reply Added',
          message: 'Your reply was added successfully',
          type: 'success'
        });
      });

      newSocket.on('replyError', (error) => {
        console.error('Reply error:', error);
        addNotification({
          title: 'Error',
          message: error.message || 'Failed to add reply',
          type: 'error'
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
      try {
        if (!user._id || !user.name) {
          console.error('Invalid user data:', user);
          addNotification({
            title: 'Error',
            message: 'User data is incomplete. Please try logging in again.',
            type: 'error'
          });
          return;
        }

        const messageData = {
          userId: user._id,
          userName: user.name,
          message: content
        };

        console.log('Sending message with data:', messageData);
        
        socket.emit('sendMessage', messageData);
        addNotification({
          title: 'Success',
          message: 'Your post has been created',
          type: 'success'
        });
      } catch (error) {
        console.error('Error sending message:', error);
        addNotification({
          title: 'Error',
          message: 'Failed to send message. Please try again.',
          type: 'error'
        });
      }
    } else {
      console.error('Socket or user not available:', { socket: !!socket, user: !!user });
      addNotification({
        title: 'Error',
        message: 'Unable to send message. Please try again later.',
        type: 'error'
      });
    }
  };

  const likeMessage = (messageId) => {
    if (socket && user) {
      socket.emit('likeMessage', {
        messageId,
        userId: user._id,
        userName: user.name
      });
      addNotification({
        title: 'Success',
        message: 'You liked a post',
        type: 'success'
      });
    }
  };

  const dislikeMessage = (messageId) => {
    if (socket && user) {
      socket.emit('dislikeMessage', {
        messageId,
        userId: user._id,
        userName: user.name
      });
      addNotification({
        title: 'Success',
        message: 'You disliked a post',
        type: 'warning'
      });
    }
  };

  const addComment = (messageId, content) => {
    if (socket && user) {
      socket.emit('addComment', {
        messageId,
        comment: {
          content,
          sender: user._id,
          senderName: user.name,
          timestamp: new Date()
        }
      });
      addNotification({
        title: 'Success',
        message: 'Your comment has been added',
        type: 'success'
      });
    }
  };

  const addReply = async (messageId, commentId, content) => {
    try {
      if (!socket) {
        throw new Error('Socket not connected');
      }

      if (!user) {
        throw new Error('User not authenticated');
      }

      console.log('Adding reply:', { messageId, commentId, content });
      socket.emit('addReply', {
        messageId,
        commentId,
        content,
        sender: user._id,
        senderName: user.name,
        senderPicture: user.picture
      });
    } catch (error) {
      console.error('Error adding reply:', error);
      addNotification({
        title: 'Error',
        message: 'Failed to add reply',
        type: 'error'
      });
    }
  };

  const value = {
    messages,
    notifications,
    removeNotification,
    sendMessage,
    likeMessage,
    dislikeMessage,
    addComment,
    addReply
  };

  return (
    <ChatContext.Provider value={value}>
      {children}
    </ChatContext.Provider>
  );
}; 