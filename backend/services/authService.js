//for forget password resetting 
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const User = require('../models/User');

exports.forgotPasswordService = async (email) => {
  const user = await User.findOne({ email });
  if (!user) throw new Error('User not found');

  const token = crypto.randomBytes(20).toString('hex');
  user.resetPasswordToken = token;
  user.resetPasswordExpires = Date.now() + 3600000;
  await user.save();

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const resetLink = `http://localhost:3000/reset-password/${token}`;

  await transporter.sendMail({
    to: email,
    subject: 'Reset Your Password',
    text: `Click the link to reset: ${resetLink}`,
  });

  return { message: 'Email sent' };
};

exports.resetPasswordService = async (token, newPassword) => {
  const user = await User.findOne({
    resetPasswordToken: token,
    resetPasswordExpires: { $gt: Date.now() },
  });
  if (!user) throw new Error('Invalid or expired token');

  user.password = newPassword;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpires = undefined;

  await user.save();
  return { message: 'Password successfully reset' };
};
