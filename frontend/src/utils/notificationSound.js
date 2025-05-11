const notificationSound = new Audio('/notification.mp3');

export const playNotificationSound = () => {
  try {
    notificationSound.currentTime = 0;
    notificationSound.play().catch(error => {
      console.log('Error playing notification sound:', error);
    });
  } catch (error) {
    console.log('Error with notification sound:', error);
  }
}; 