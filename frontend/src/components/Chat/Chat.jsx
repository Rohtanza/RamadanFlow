import React, { useState, useRef, useEffect } from 'react';
import { useChat } from '../../context/ChatContext';
import { useAuth } from '../../context/AuthContext';
import { format } from 'date-fns';
import { HiThumbUp, HiThumbDown, HiChat, HiOutlineThumbUp, HiOutlineThumbDown, HiPaperAirplane, HiReply } from 'react-icons/hi';
import ChatNotification from './ChatNotification';

const Chat = () => {
  const [postContent, setPostContent] = useState('');
  const [commentText, setCommentText] = useState('');
  const [replyText, setReplyText] = useState('');
  const [activeCommentId, setActiveCommentId] = useState(null);
  const [activeReplyId, setActiveReplyId] = useState(null);
  const messagesEndRef = useRef(null);
  const { messages, notifications, removeNotification, sendMessage, likeMessage, dislikeMessage, addComment, addReply } = useChat();
  const { user } = useAuth();

  useEffect(() => {
    console.log('Current user in Chat component:', user);
  }, [user]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handlePostSubmit = (e) => {
    e.preventDefault();
    if (!user) {
      console.error('No user data available');
      return;
    }
    
    if (postContent.trim()) {
      console.log('Submitting post with user:', user);
      sendMessage(postContent.trim());
      setPostContent('');
    }
  };

  const handleCommentSubmit = (messageId) => {
    if (!user) {
      console.error('No user data available');
      return;
    }

    if (commentText.trim()) {
      addComment(messageId, commentText.trim());
      setCommentText('');
      setActiveCommentId(null);
    }
  };

  const handleReplySubmit = (messageId, commentId) => {
    if (!user) {
      console.error('No user data available');
      return;
    }

    if (replyText.trim()) {
      addReply(messageId, commentId, replyText.trim());
      setReplyText('');
      setActiveReplyId(null);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-cover bg-center relative" style={{ backgroundImage: "url('/home-back.jpg')" }}>
        <div className="absolute inset-0 bg-black bg-opacity-30"></div>
        <div className="relative z-10 min-h-screen flex items-center justify-center pt-20">
          <div className="bg-gray-900 bg-opacity-90 backdrop-blur-lg p-8 rounded-2xl shadow-lg w-full max-w-4xl mx-4 border border-gray-700">
            <h2 className="text-3xl font-bold text-white mb-4">Community Chat</h2>
            <p className="text-gray-300">Please log in to participate in the chat.</p>
          </div>
        </div>
      </div>
    );
  }

  const renderComment = (comment, messageId, isReply = false) => (
    <div key={comment._id} className={`bg-gray-800 bg-opacity-50 rounded-lg p-4 border border-gray-700 ${isReply ? 'ml-8' : ''}`}>
      <div className="flex items-center space-x-2 mb-2">
        <img
          src={comment.senderPicture || `https://ui-avatars.com/api/?name=${comment.senderName}&background=random`}
          alt={comment.senderName}
          className="w-8 h-8 rounded-full object-cover border border-yellow-500"
        />
        <div>
          <p className="font-medium text-white">{comment.senderName}</p>
          <p className="text-xs text-gray-400">
            {format(new Date(comment.timestamp), 'MMM d, yyyy h:mm a')}
          </p>
        </div>
      </div>
      <p className="text-gray-300 mb-2">{comment.content}</p>
      {!isReply && (
        <button
          onClick={() => setActiveReplyId(activeReplyId === comment._id ? null : comment._id)}
          className="flex items-center space-x-1 text-gray-400 hover:text-yellow-500 text-sm"
        >
          <HiReply className="w-4 h-4" />
          <span>Reply</span>
        </button>
      )}
      {activeReplyId === comment._id && (
        <div className="mt-2 flex space-x-2">
          <input
            type="text"
            value={replyText}
            onChange={(e) => setReplyText(e.target.value)}
            placeholder="Write a reply..."
            className="flex-1 rounded-lg bg-gray-700 bg-opacity-50 border border-gray-600 px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-500 text-sm"
          />
          <button
            onClick={() => handleReplySubmit(messageId, comment._id)}
            disabled={!replyText.trim()}
            className="bg-yellow-500 text-gray-900 px-4 py-2 rounded-lg hover:bg-yellow-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-semibold text-sm"
          >
            Reply
          </button>
        </div>
      )}
      {comment.replies && comment.replies.length > 0 && (
        <div className="mt-4 space-y-4">
          {comment.replies.map((reply) => renderComment(reply, messageId, true))}
        </div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-cover bg-center relative" style={{ backgroundImage: "url('/home-back.jpg')" }}>
      <div className="absolute inset-0 bg-black bg-opacity-30"></div>
      <div className="relative z-10 min-h-screen pt-20 pb-8">
        <ChatNotification notifications={notifications} removeNotification={removeNotification} />
        <div className="max-w-4xl mx-auto px-4">
          {/* Create Post Form */}
          <div className="bg-gray-900 bg-opacity-90 backdrop-blur-lg rounded-2xl shadow-lg p-6 mb-8 border border-gray-700">
            <h2 className="text-3xl font-bold text-white mb-4">Create a Post</h2>
            <form onSubmit={handlePostSubmit} className="space-y-4">
              <textarea
                value={postContent}
                onChange={(e) => setPostContent(e.target.value)}
                placeholder="What's on your mind?"
                className="w-full h-32 p-4 bg-gray-800 bg-opacity-50 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-500 resize-none"
              />
              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={!postContent.trim()}
                  className="flex items-center space-x-2 bg-yellow-500 text-gray-900 px-6 py-2 rounded-lg hover:bg-yellow-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-semibold"
                >
                  <span>Post</span>
                  <HiPaperAirplane className="w-5 h-5" />
                </button>
              </div>
            </form>
          </div>

          {/* Posts List */}
          <div className="space-y-6">
            {messages.map((msg) => (
              <div key={msg._id} className="bg-gray-900 bg-opacity-90 backdrop-blur-lg rounded-2xl shadow-lg p-6 border border-gray-700">
                {/* Post Header */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <img
                      src={msg.senderPicture || `https://ui-avatars.com/api/?name=${msg.senderName}&background=random`}
                      alt={msg.senderName}
                      className="w-10 h-10 rounded-full object-cover border-2 border-yellow-500"
                    />
                    <div>
                      <h3 className="font-semibold text-white">{msg.senderName}</h3>
                      <p className="text-sm text-gray-400">
                        {format(new Date(msg.timestamp), 'MMM d, yyyy h:mm a')}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Post Content */}
                <p className="text-gray-300 mb-4">{msg.content}</p>

                {/* Post Actions */}
                <div className="flex items-center space-x-6 border-t border-b border-gray-700 py-3 mb-4">
                  <button
                    onClick={() => likeMessage(msg._id)}
                    className={`flex items-center space-x-2 ${
                      msg.likes?.includes(user._id)
                        ? 'text-green-500'
                        : 'text-gray-400 hover:text-green-500'
                    }`}
                  >
                    {msg.likes?.includes(user._id) ? (
                      <HiThumbUp className="w-5 h-5" />
                    ) : (
                      <HiOutlineThumbUp className="w-5 h-5" />
                    )}
                    <span>{msg.likes?.length || 0}</span>
                  </button>

                  <button
                    onClick={() => dislikeMessage(msg._id)}
                    className={`flex items-center space-x-2 ${
                      msg.dislikes?.includes(user._id)
                        ? 'text-red-500'
                        : 'text-gray-400 hover:text-red-500'
                    }`}
                  >
                    {msg.dislikes?.includes(user._id) ? (
                      <HiThumbDown className="w-5 h-5" />
                    ) : (
                      <HiOutlineThumbDown className="w-5 h-5" />
                    )}
                    <span>{msg.dislikes?.length || 0}</span>
                  </button>

                  <button
                    onClick={() => setActiveCommentId(activeCommentId === msg._id ? null : msg._id)}
                    className="flex items-center space-x-2 text-gray-400 hover:text-yellow-500"
                  >
                    <HiChat className="w-5 h-5" />
                    <span>{msg.comments?.length || 0} Comments</span>
                  </button>
                </div>

                {/* Comments Section */}
                {activeCommentId === msg._id && (
                  <div className="space-y-4">
                    {/* Comments List */}
                    <div className="space-y-4">
                      {msg.comments?.map((comment) => renderComment(comment, msg._id))}
                    </div>

                    {/* Comment Input */}
                    <div className="flex space-x-2">
                      <input
                        type="text"
                        value={commentText}
                        onChange={(e) => setCommentText(e.target.value)}
                        placeholder="Write a comment..."
                        className="flex-1 rounded-lg bg-gray-800 bg-opacity-50 border border-gray-700 px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-500"
                      />
                      <button
                        onClick={() => handleCommentSubmit(msg._id)}
                        disabled={!commentText.trim()}
                        className="bg-yellow-500 text-gray-900 px-4 py-2 rounded-lg hover:bg-yellow-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-semibold"
                      >
                        Comment
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Chat; 