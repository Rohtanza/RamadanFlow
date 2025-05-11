const express = require('express');
const router = express.Router();
const Chat = require('../models/Chat');
const auth = require('../middleware/auth');

// Get chat history
router.get('/history', auth, async (req, res) => {
  try {
    let chat = await Chat.findOne({ isActive: true })
      .populate('messages.sender', 'name picture')
      .populate('participants', 'name picture')
      .sort({ 'messages.timestamp': -1 });

    if (!chat) {
      // Create a new chat if none exists
      chat = await Chat.create({
        name: 'Community Chat',
        isActive: true,
        participants: [req.user._id]
      });
    }

    // Add user to participants if not already included
    if (!chat.participants.includes(req.user._id)) {
      chat.participants.push(req.user._id);
      await chat.save();
    }

    res.json(chat.messages);
  } catch (error) {
    console.error('Error fetching chat history:', error);
    res.status(500).json({ message: 'Error fetching chat history', error: error.message });
  }
});

// Get a single message
router.get('/message/:messageId', auth, async (req, res) => {
  try {
    const chat = await Chat.findOne({ isActive: true });
    if (!chat) {
      return res.status(404).json({ message: 'No active chat found' });
    }

    const message = chat.messages.id(req.params.messageId);
    if (!message) {
      return res.status(404).json({ message: 'Message not found' });
    }

    res.json(message);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching message', error: error.message });
  }
});

// Delete a message (only by sender or admin)
router.delete('/message/:messageId', auth, async (req, res) => {
  try {
    const chat = await Chat.findOne({ isActive: true });
    if (!chat) {
      return res.status(404).json({ message: 'No active chat found' });
    }

    const message = chat.messages.id(req.params.messageId);
    if (!message) {
      return res.status(404).json({ message: 'Message not found' });
    }

    // Check if user is the sender or an admin
    if (message.sender.toString() !== req.user._id && !req.user.isAdmin) {
      return res.status(403).json({ message: 'Not authorized to delete this message' });
    }

    message.remove();
    await chat.save();

    res.json({ message: 'Message deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting message', error: error.message });
  }
});

// Mark messages as read
router.post('/read', auth, async (req, res) => {
  try {
    const { messageIds } = req.body;
    const chat = await Chat.findOne({ isActive: true });
    
    if (!chat) {
      return res.status(404).json({ message: 'No active chat found' });
    }

    messageIds.forEach(messageId => {
      const message = chat.messages.id(messageId);
      if (message && !message.readBy.includes(req.user._id)) {
        message.readBy.push(req.user._id);
      }
    });

    await chat.save();
    res.json({ message: 'Messages marked as read' });
  } catch (error) {
    res.status(500).json({ message: 'Error marking messages as read', error: error.message });
  }
});

module.exports = router; 