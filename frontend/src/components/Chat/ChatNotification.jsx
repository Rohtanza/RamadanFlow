import React, { useEffect } from 'react';

const ChatNotification = ({ notifications, removeNotification }) => {
  useEffect(() => {
    console.log('ChatNotification component - Current notifications:', notifications);
  }, [notifications]);

  if (!notifications || notifications.length === 0) {
    console.log('No notifications to display');
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 z-[9999] space-y-2">
      {notifications.map((notification) => {
        console.log('Rendering notification:', notification);
        return (
          <div
            key={notification.id}
            className={`p-4 rounded-lg shadow-lg transform transition-all duration-300 ease-in-out animate-slide-in ${
              notification.type === 'success'
                ? 'bg-green-500'
                : notification.type === 'error'
                ? 'bg-red-500'
                : notification.type === 'warning'
                ? 'bg-yellow-500'
                : 'bg-blue-500'
            } text-white min-w-[300px] max-w-[400px]`}
            style={{
              animation: 'slideIn 0.3s ease-out',
              boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1), 0 1px 3px rgba(0, 0, 0, 0.08)'
            }}
          >
            <div className="flex items-center justify-between">
              <div className="flex-1">
                {notification.title && (
                  <h4 className="font-semibold mb-1 text-lg">{notification.title}</h4>
                )}
                <p className="text-sm">{notification.message}</p>
              </div>
              <button
                onClick={() => removeNotification(notification.id)}
                className="ml-4 text-white hover:text-gray-200 transition-colors duration-200"
              >
                ×
              </button>
            </div>
          </div>
        );
      })}
      <style jsx>{`
        @keyframes slideIn {
          from {
            transform: translateX(100%) translateY(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0) translateY(0);
            opacity: 1;
          }
        }
        .animate-slide-in {
          animation: slideIn 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

export default ChatNotification; 