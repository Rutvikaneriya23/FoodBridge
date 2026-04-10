import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';
import {
  FaArrowLeft,
  FaPaperPlane,
  FaUser,
  FaTruck,
  FaUsers,
  FaUtensils
} from 'react-icons/fa';
import './Chat.css';

const Chat = () => {
  const { donationId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [donation, setDonation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef(null);

  // AI Assistant welcome message
  const aiWelcomeMessage = {
    _id: 'ai-welcome',
    sender: { name: 'FoodBridge AI Assistant' },
    senderRole: 'bot',
    message: "Hello! 👋 I'm FoodBridge AI Assistant. I'm here to help you with any questions about donating food, receiving donations, volunteering, or using our platform. What would you like to know?",
    createdAt: new Date().toISOString(),
    isAI: true
  };

  useEffect(() => {
    fetchDonation();
    fetchMessages();
    // Auto-refresh every 5 seconds for real-time feel
    const interval = setInterval(fetchMessages, 5000);
    return () => clearInterval(interval);
  }, [donationId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchDonation = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await axios.get(
        `http://localhost:5000/api/donations/${donationId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (response.data.success) {
        setDonation(response.data.donation);
      }
    } catch (err) {
      console.error('Fetch donation error:', err);
    }
  };

  const fetchMessages = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await axios.get(
        `http://localhost:5000/api/messages/donation/${donationId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (response.data.success) {
        setMessages(response.data.messages);
      }
      setLoading(false);
    } catch (err) {
      console.error('Fetch messages error:', err);
      setError(err.response?.data?.message || 'Failed to load messages');
      setLoading(false);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || sending) return;

    setSending(true);
    try {
      const token = localStorage.getItem('authToken');
      const response = await axios.post(
        'http://localhost:5000/api/messages',
        {
          donationId,
          message: newMessage.trim()
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        setMessages([...messages, response.data.message]);
        setNewMessage('');
        scrollToBottom();
      }
    } catch (err) {
      console.error('Send message error:', err);
      alert(err.response?.data?.message || 'Failed to send message');
    } finally {
      setSending(false);
    }
  };

  const getRoleIcon = (role) => {
    switch (role) {
      case 'donor':
        return <FaUtensils />;
      case 'receiver':
        return <FaUsers />;
      case 'volunteer':
        return <FaTruck />;
      case 'bot':
        return <img src="/Foodbridge_black.svg" alt="AI" style={{ width: '20px', height: '20px', objectFit: 'contain' }} />;
      default:
        return <FaUser />;
    }
  };

  const getRoleBadge = (role) => {
    const badges = {
      donor: { label: 'Donor', color: '#FF9800' },
      receiver: { label: 'Receiver', color: '#8BC34A' },
      volunteer: { label: 'Volunteer', color: '#2196F3' },
      bot: { label: 'AI Assistant', color: '#FF8C00' }
    };
    const badge = badges[role] || { label: role, color: '#757575' };
    return (
      <span
        style={{
          background: badge.color,
          color: 'white',
          padding: '2px 8px',
          borderRadius: '12px',
          fontSize: '11px',
          fontWeight: 'bold',
          marginLeft: '8px'
        }}
      >
        {badge.label}
      </span>
    );
  };

  const formatTime = (date) => {
    return new Date(date).toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDate = (date) => {
    const msgDate = new Date(date);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (msgDate.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (msgDate.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return msgDate.toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short'
      });
    }
  };

  const isMyMessage = (message) => {
    return message.sender._id === user._id;
  };

  // Group messages by date
  const groupedMessages = messages.reduce((groups, message) => {
    const date = formatDate(message.createdAt);
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(message);
    return groups;
  }, {});

  // Add AI welcome message to the first group
  const allGroupedMessages = { ...groupedMessages };
  const today = formatDate(new Date());
  if (!allGroupedMessages[today]) {
    allGroupedMessages[today] = [];
  }
  // Add AI message at the beginning only if there are no messages or very few
  if (messages.length === 0) {
    allGroupedMessages[today] = [aiWelcomeMessage, ...allGroupedMessages[today]];
  }

  if (loading) {
    return (
      <div className="chat-container">
        <div className="chat-loading">Loading chat...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="chat-container">
        <div className="chat-error">
          <p>{error}</p>
          <button onClick={() => navigate(-1)} className="btn btn-primary">
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="chat-container">
      {/* Chat Header */}
      <div className="chat-header">
        <div className="chat-header-left">
          <button onClick={() => navigate(-1)} className="back-button">
            <FaArrowLeft />
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginLeft: '15px' }}>
            <img src="/Foodbridge_black.svg" alt="FoodBridge" style={{ height: '50px', width: 'auto', objectFit: 'contain', filter: 'drop-shadow(0 4px 8px rgba(255, 140, 0, 0.3))' }} />
            <span style={{ fontFamily: 'Poppins, sans-serif', fontSize: '28px', fontWeight: '800', background: 'linear-gradient(135deg, #FF8C00 0%, #FF6B00 50%, #FFB347 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', letterSpacing: '-0.5px' }}>Food Bridge</span>
          </div>
        </div>
        <div className="chat-header-info">
          <h3>{donation?.foodName || 'Donation Chat'}</h3>
          <p className="chat-subtitle">
            {donation?.foodType} • {donation?.quantity} {donation?.quantityUnit}
          </p>
        </div>
        <div className="chat-participants">
          <div className="participant-badge">
            <FaUtensils /> Donor
          </div>
          {donation?.assignedTo?.receiver && (
            <div className="participant-badge">
              <FaUsers /> Receiver
            </div>
          )}
          {donation?.assignedTo?.volunteer && (
            <div className="participant-badge">
              <FaTruck /> Volunteer
            </div>
          )}
        </div>
      </div>

      {/* Messages Area */}
      <div className="chat-messages">
        {Object.keys(allGroupedMessages).length === 0 ? (
          <div className="chat-empty">
            <img src="/Foodbridge_black.svg" alt="FoodBridge" style={{ width: '80px', height: '80px', objectFit: 'contain', opacity: 0.3, marginBottom: '16px' }} />
            <p>No messages yet</p>
            <p className="text-muted">Start the conversation!</p>
          </div>
        ) : (
          Object.entries(allGroupedMessages).map(([date, dateMessages]) => (
            <div key={date}>
              <div className="message-date-separator">{date}</div>
              {dateMessages.map((message) => (
                <div
                  key={message._id}
                  className={`message ${message.isAI || !isMyMessage(message) ? 'message-received' : 'message-sent'}`}
                >
                  {(message.isAI || !isMyMessage(message)) && (
                    <div className="message-sender">
                      <span className="sender-icon">{getRoleIcon(message.senderRole)}</span>
                      <span className="sender-name">{message.sender.name}</span>
                      {getRoleBadge(message.senderRole)}
                    </div>
                  )}
                  <div className={`message-bubble ${message.isAI ? 'ai-message-bubble' : ''}`}>
                    <p className="message-text">{message.message}</p>
                    <span className="message-time">{formatTime(message.createdAt)}</span>
                  </div>
                </div>
              ))}
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <form onSubmit={handleSendMessage} className="chat-input-form">
        <div className="chat-input-container">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type your message..."
            className="chat-input"
            maxLength={500}
            disabled={sending}
          />
          <button
            type="submit"
            className="send-button"
            disabled={!newMessage.trim() || sending}
          >
            <FaPaperPlane />
          </button>
        </div>
        <div className="char-count">
          {newMessage.length}/500
        </div>
      </form>
    </div>
  );
};

export default Chat;
