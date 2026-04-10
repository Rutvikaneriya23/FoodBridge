import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { FaArrowLeft, FaPaperPlane, FaQuestionCircle, FaHome } from 'react-icons/fa';
import './ContactSupport.css';

const ContactSupport = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [message, setMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: "Hello! 👋 I'm FoodBridge AI Assistant. I'm here to help you with any questions about donating food, receiving donations, volunteering, or using our platform. What would you like to know?",
      sender: 'support',
      timestamp: new Date().toISOString()
    }
  ]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const getAIResponse = (userMessage) => {
    const lowerMsg = userMessage.toLowerCase();
    
    // Donation related queries
    if (lowerMsg.includes('donate') || lowerMsg.includes('donation') || lowerMsg.includes('give food')) {
      return "Great question about donations! 🍽️\n\n" +
             "To donate food on FoodBridge:\n" +
             "1. Go to your dashboard\n" +
             "2. Click 'Add Donation'\n" +
             "3. Fill in food details (name, quantity, expiry date)\n" +
             "4. Add pickup location and contact info\n" +
             "5. Submit!\n\n" +
             "Your donation will be visible to receivers and volunteers nearby. You can donate cooked meals, packaged foods, fruits, vegetables, and more. Is there anything specific about donations you'd like to know?";
    }
    
    // Receiving food queries
    if (lowerMsg.includes('receive') || lowerMsg.includes('get food') || lowerMsg.includes('claim')) {
      return "Looking to receive food? Here's how it works! 🙏\n\n" +
             "1. Browse 'Available Donations' on your dashboard\n" +
             "2. View donation details (food type, quantity, location)\n" +
             "3. Click 'Claim' on the food you need\n" +
             "4. A volunteer will be assigned for delivery\n" +
             "5. Track your delivery in real-time\n\n" +
             "You can see donations on the map and filter by distance. All food is quality-checked before delivery. Need help with anything else?";
    }
    
    // Volunteer queries
    if (lowerMsg.includes('volunteer') || lowerMsg.includes('deliver') || lowerMsg.includes('help')) {
      return "Wonderful that you want to volunteer! 🚚\n\n" +
             "As a volunteer, you:\n" +
             "- Pick up food from donors\n" +
             "- Deliver to receivers in need\n" +
             "- Earn rewards for each delivery\n" +
             "- Help reduce food waste\n\n" +
             "To get started:\n" +
             "1. Register on the volunteer dashboard\n" +
             "2. Set your availability and service area\n" +
             "3. Accept delivery tasks\n" +
             "4. Pick up and deliver!\n\n" +
             "You'll see available tasks with pickup/dropoff locations and rewards. Want to know more?";
    }
    
    // Account/Profile queries
    if (lowerMsg.includes('account') || lowerMsg.includes('profile') || lowerMsg.includes('password') || lowerMsg.includes('email')) {
      return "Need help with your account? 👤\n\n" +
             "You can manage your profile by:\n" +
             "1. Click the Profile button in the navigation\n" +
             "2. Update your name, phone, location\n" +
             "3. Change your password from settings\n" +
             "4. Switch roles if needed (donor/receiver/volunteer)\n\n" +
             "If you're having trouble logging in or forgot your password, please contact us at support@foodbridge.com. How else can I assist?";
    }
    
    // Tracking queries
    if (lowerMsg.includes('track') || lowerMsg.includes('delivery') || lowerMsg.includes('status') || lowerMsg.includes('where')) {
      return "Want to track your food? 📍\n\n" +
             "Real-time tracking is available!\n" +
             "- Donors: See when food is picked up and delivered\n" +
             "- Receivers: Track your delivery on the map\n" +
             "- Volunteers: Update delivery status\n\n" +
             "Check 'My Deliveries' on your dashboard to see:\n" +
             "✓ Current location\n" +
             "✓ Estimated arrival time\n" +
             "✓ Volunteer contact info\n" +
             "✓ Delivery status updates\n\n" +
             "Is there a specific delivery you'd like help with?";
    }
    
    // Food safety queries
    if (lowerMsg.includes('safe') || lowerMsg.includes('quality') || lowerMsg.includes('expiry') || lowerMsg.includes('fresh')) {
      return "Food safety is our priority! 🛡️\n\n" +
             "We ensure quality by:\n" +
             "- Requiring expiry dates for all donations\n" +
             "- Volunteer quality verification at pickup\n" +
             "- Real-time freshness tracking\n" +
             "- Temperature guidelines for transport\n" +
             "- Quick delivery times\n\n" +
             "Tips:\n" +
             "• Donate food well before expiry\n" +
             "• Package food properly\n" +
             "• Mention storage instructions\n" +
             "• Report any quality issues\n\n" +
             "Your safety matters to us! Any other concerns?";
    }
    
    // Technical issues
    if (lowerMsg.includes('error') || lowerMsg.includes('bug') || lowerMsg.includes('not working') || lowerMsg.includes('problem')) {
      return "Sorry you're experiencing issues! 🔧\n\n" +
             "Common fixes:\n" +
             "1. Refresh the page (Ctrl+R)\n" +
             "2. Clear browser cache\n" +
             "3. Check your internet connection\n" +
             "4. Try a different browser\n" +
             "5. Update your app\n\n" +
             "If the problem persists:\n" +
             "📧 Email: support@foodbridge.com\n" +
             "📞 Call: +1-800-FOODBRIDGE\n\n" +
             "Please describe the exact error message or issue, and we'll help resolve it quickly!";
    }
    
    // Location/Map queries
    if (lowerMsg.includes('map') || lowerMsg.includes('location') || lowerMsg.includes('distance') || lowerMsg.includes('nearby')) {
      return "Need help with locations? 🗺️\n\n" +
             "Our interactive map shows:\n" +
             "- Available donations near you\n" +
             "- Distance from your location\n" +
             "- Pickup and delivery points\n" +
             "- Real-time volunteer tracking\n\n" +
             "You can:\n" +
             "✓ Filter by distance\n" +
             "✓ See multiple donations at once\n" +
             "✓ Get directions to pickup points\n" +
             "✓ Set your service radius (volunteers)\n\n" +
             "Make sure location permissions are enabled for the best experience!";
    }
    
    // Rewards queries
    if (lowerMsg.includes('reward') || lowerMsg.includes('points') || lowerMsg.includes('earn') || lowerMsg.includes('incentive')) {
      return "Interested in rewards? 🎁\n\n" +
             "Volunteers earn rewards for deliveries!\n" +
             "- Based on delivery distance\n" +
             "- Paid per completed delivery\n" +
             "- Track earnings on your dashboard\n" +
             "- Bonus for multiple deliveries\n\n" +
             "Typical rewards: ₹15-₹100 per delivery\n\n" +
             "Coming soon:\n" +
             "• Donor appreciation badges\n" +
             "• Receiver loyalty points\n" +
             "• Community leaderboards\n\n" +
             "Every contribution makes a difference! 💚";
    }
    
    // Contact/Support queries
    if (lowerMsg.includes('contact') || lowerMsg.includes('phone') || lowerMsg.includes('email') || lowerMsg.includes('reach')) {
      return "Need to reach our team? 📞\n\n" +
             "Contact Information:\n" +
             "📧 Email: support@foodbridge.com\n" +
             "📱 Phone: +1-800-FOODBRIDGE\n" +
             "💬 Live Chat: Right here!\n" +
             "🕐 Hours: 24/7 Support\n\n" +
             "Response times:\n" +
             "- Chat: Instant (AI) / 5-10 min (Human)\n" +
             "- Email: Within 24 hours\n" +
             "- Phone: Immediate\n\n" +
             "For urgent issues, please call. I'm always here to help! 😊";
    }
    
    // Thank you / Appreciation
    if (lowerMsg.includes('thank') || lowerMsg.includes('thanks') || lowerMsg.includes('appreciate')) {
      return "You're very welcome! 😊\n\n" +
             "It's my pleasure to help! FoodBridge exists to:\n" +
             "🌟 Reduce food waste\n" +
             "🤝 Help those in need\n" +
             "💚 Build community connections\n\n" +
             "Thank YOU for being part of this mission! If you have any more questions anytime, just ask. Have a wonderful day! 🎉";
    }
    
    // Greetings
    if (lowerMsg.includes('hello') || lowerMsg.includes('hi ') || lowerMsg.includes('hey')) {
      return "Hello there! 👋\n\n" +
             "Great to see you! I'm here to help with:\n" +
             "🍽️ Donating food\n" +
             "📦 Receiving donations\n" +
             "🚚 Volunteering\n" +
             "📱 Platform features\n" +
             "🛠️ Technical issues\n\n" +
             "What would you like to know about?";
    }
    
    // How to start queries
    if (lowerMsg.includes('how to start') || lowerMsg.includes('getting started') || lowerMsg.includes('begin')) {
      return "Welcome to FoodBridge! Let's get you started! 🚀\n\n" +
             "As a " + (user?.role || 'user') + ":\n\n" +
             (user?.role === 'donor' ? 
               "1. Click 'Add Donation' on your dashboard\n2. Fill in food details\n3. Wait for receivers to claim\n4. A volunteer will pick up the food\n\n" :
             user?.role === 'receiver' ?
               "1. Browse available donations\n2. Check the map for nearby food\n3. Click 'Claim' on what you need\n4. Track delivery in real-time\n\n" :
             user?.role === 'volunteer' ?
               "1. Complete volunteer registration\n2. Set your availability\n3. Accept delivery tasks\n4. Pick up and deliver food\n\n" :
               "Choose your role and follow the dashboard prompts!\n\n") +
             "Need more detailed help with any step?";
    }
    
    // Default fallback response
    return "I understand you have a question! 🤔\n\n" +
           "I can help you with:\n" +
           "• How to donate food\n" +
           "• Receiving donations\n" +
           "• Volunteering for deliveries\n" +
           "• Tracking orders\n" +
           "• Account settings\n" +
           "• Food safety\n" +
           "• Technical issues\n\n" +
           "Could you please rephrase your question, or ask about any of these topics? I'm here to help! 😊\n\n" +
           "For complex issues, contact:\n" +
           "📧 support@foodbridge.com\n" +
           "📞 +1-800-FOODBRIDGE";
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (message.trim()) {
      const userMessage = {
        id: messages.length + 1,
        text: message,
        sender: 'user',
        timestamp: new Date().toISOString()
      };
      setMessages(prev => [...prev, userMessage]);
      const currentMessage = message;
      setMessage('');
      
      // Show typing indicator
      setIsTyping(true);

      // AI response with realistic delay
      setTimeout(() => {
        setIsTyping(false);
        const aiResponse = {
          id: messages.length + 2,
          text: getAIResponse(currentMessage),
          sender: 'support',
          timestamp: new Date().toISOString()
        };
        setMessages(prev => [...prev, aiResponse]);
      }, 1000 + Math.random() * 1000);
    }
  };

  return (
    <div className="support-chat-page">
      {/* Header */}
      <div className="support-chat-header">
        <button className="back-btn" onClick={() => navigate(-1)}>
          <FaArrowLeft />
        </button>
        <div className="support-header-info">
          <h2>FoodBridge Support</h2>
          <span className="status-badge online">● Online</span>
        </div>
        <button 
          className="support-dashboard-btn" 
          onClick={() => navigate(`/${user?.role}-dashboard`)}
        >
          <FaHome /> Back to Dashboard
        </button>
      </div>

      {/* Messages Area */}
      <div className="support-messages-container">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`support-message ${msg.sender === 'user' ? 'user-message' : 'support-message-item'}`}
          >
            {msg.sender === 'support' && (
              <div className="support-avatar">
                <FaQuestionCircle />
              </div>
            )}
            <div className="message-bubble">
              <p style={{ whiteSpace: 'pre-line' }}>{msg.text}</p>
              <span className="message-timestamp">
                {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          </div>
        ))}
        
        {/* Typing Indicator */}
        {isTyping && (
          <div className="support-message support-message-item">
            <div className="support-avatar">
              <FaQuestionCircle />
            </div>
            <div className="message-bubble typing-indicator">
              <div className="typing-dots">
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <form className="support-input-area" onSubmit={handleSendMessage}>
        <input
          type="text"
          className="support-input"
          placeholder="Type your message..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />
        <button type="submit" className="support-send-btn" disabled={!message.trim()}>
          <FaPaperPlane />
        </button>
      </form>
    </div>
  );
};

export default ContactSupport;
