import React, { createContext, useContext, useReducer, useState, useEffect, useRef } from 'react';
import { Send, User, Circle } from 'lucide-react';
import { generateBotResponse, simulateBotTyping, getBotUsers, botPersonalities } from './utils/bots';
import './ChatApp.css';

// Context API for Chat State Management
const ChatContext = createContext();

// Chat reducer for managing messages and users
const chatReducer = (state, action) => {
  switch (action.type) {
    case 'ADD_MESSAGE':
      return {
        ...state,
        messages: [...state.messages, action.payload],
        lastActivity: Date.now()
      };
    case 'UPDATE_USER_PRESENCE':
      return {
        ...state,
        users: {
          ...state.users,
          [action.payload.userId]: {
            ...state.users[action.payload.userId],
            isOnline: action.payload.isOnline,
            lastSeen: action.payload.lastSeen
          }
        }
      };
    case 'SET_TYPING':
      return {
        ...state,
        typingUsers: action.payload.isTyping 
          ? [...state.typingUsers.filter(id => id !== action.payload.userId), action.payload.userId]
          : state.typingUsers.filter(id => id !== action.payload.userId)
      };
    default:
      return state;
  };
};

// Generate initial welcome messages from bots
const generateInitialMessages = () => {
  const messages = [];
  const botTypes = ['techBot', 'designBot', 'projectBot'];
  
  // Add a welcome message from each bot
  botTypes.forEach((botType, index) => {
    const bot = botPersonalities[botType];
    messages.push({
      id: `init-${index}`,
      userId: bot.id,
      username: bot.username,
      avatar: bot.avatar,
      content: bot.greetings[Math.floor(Math.random() * bot.greetings.length)],
      timestamp: Date.now() - (botTypes.length - index) * 60000, // Stagger timestamps
      type: 'text'
    });
  });
  
  return messages;
};

// Denormalized data structure for optimal performance
const initialState = {
  messages: generateInitialMessages(),
  users: {
    ...getBotUsers(),
    currentUser: {
      id: 'currentUser',
      username: 'You',
      avatar: '🙋‍♂️',
      isOnline: true,
      lastSeen: Date.now()
    }
  },
  typingUsers: [],
  lastActivity: Date.now()
};

// Chat Provider Component
const ChatProvider = ({ children }) => {
  const [state, dispatch] = useReducer(chatReducer, initialState);

  // Simulate real-time user presence updates for bots
  useEffect(() => {
    const interval = setInterval(() => {
      const botIds = Object.keys(state.users).filter(id => 
        id !== 'currentUser' && id.startsWith('bot')
      );
      
      if (botIds.length > 0) {
        const randomBot = botIds[Math.floor(Math.random() * botIds.length)];
        
        dispatch({
          type: 'UPDATE_USER_PRESENCE',
          payload: {
            userId: randomBot,
            isOnline: Math.random() > 0.3,
            lastSeen: Date.now()
          }
        });
      }
    }, 30000); // Every 30 seconds

    return () => clearInterval(interval);
  }, []);

  // Process user messages and generate bot responses
  const addMessage = (content) => {
    // Add user message
    const userMessage = {
      id: Date.now().toString(),
      userId: 'currentUser',
      username: 'You',
      avatar: '🙋‍♂️',
      content,
      timestamp: Date.now(),
      type: 'text'
    };
    
    dispatch({ type: 'ADD_MESSAGE', payload: userMessage });
    
    // Determine which bot(s) should respond
    const botTypes = ['techBot', 'designBot', 'projectBot'];
    
    // Randomly select 1-2 bots to respond
    const respondingBots = botTypes
      .filter(() => Math.random() > 0.5)
      .slice(0, Math.floor(Math.random() * 2) + 1);
    
    if (respondingBots.length === 0 && Math.random() > 0.7) {
      // Ensure at least one bot responds sometimes
      respondingBots.push(botTypes[Math.floor(Math.random() * botTypes.length)]);
    }
    
    // Generate bot responses with delays
    respondingBots.forEach((botType, index) => {
      // First simulate typing
      setTimeout(() => {
        simulateBotTyping(botType, setTyping);
        
        // Then add the response after a delay
        setTimeout(() => {
          const botResponse = generateBotResponse(userMessage, botType);
          if (botResponse) {
            dispatch({ type: 'ADD_MESSAGE', payload: botResponse });
          }
        }, 1500 + Math.random() * 1000);
      }, (index + 1) * 1000); // Stagger bot responses
    });
  };

  const setTyping = (userId, isTyping) => {
    dispatch({ type: 'SET_TYPING', payload: { userId, isTyping } });
  };

  return (
    <ChatContext.Provider value={{ state, addMessage, setTyping }}>
      {children}
    </ChatContext.Provider>
  );
};

// Custom hook to use chat context
const useChat = () => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
};

// User Presence Indicator Component
const UserPresence = ({ user }) => {
  const getLastSeenText = (lastSeen) => {
    const diff = Date.now() - lastSeen;
    const minutes = Math.floor(diff / 60000);
    
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    return 'Yesterday';
  };

  return (
    <div className="flex items-center space-x-2 p-2 hover:bg-gray-50 rounded-lg transition-colors">
      <div className="relative">
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-medium">
          {user.avatar}
        </div>
        <Circle 
          className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white ${
            user.isOnline ? 'fill-green-500 text-green-500' : 'fill-gray-400 text-gray-400'
          }`}
        />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-900 truncate">{user.username}</p>
        <p className="text-xs text-gray-500">
          {user.isOnline ? 'Online' : getLastSeenText(user.lastSeen)}
        </p>
      </div>
    </div>
  );
};

// Message Component
const Message = ({ message, isOwn }) => (
  <div className={`message ${isOwn ? 'own' : ''}`}>
    <div className="message-bubble">
      {!isOwn && (
        <div className="message-sender">
          <span>{message.avatar}</span>
          <span>{message.username}</span>
        </div>
      )}
      <p>{message.content}</p>
      <div className="message-time">
        {new Date(message.timestamp).toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit'
        })}
      </div>
    </div>
  </div>
);

// Typing Indicator Component
const TypingIndicator = () => {
  const { state } = useChat();
  
  if (state.typingUsers.length === 0) return null;
  
  const typingUsernames = state.typingUsers
    .map(userId => state.users[userId]?.username)
    .filter(Boolean);

  return (
    <div className="typing-indicator">
      <div className="typing-dots">
        <div className="typing-dot"></div>
        <div className="typing-dot"></div>
        <div className="typing-dot"></div>
      </div>
      <span>
        {typingUsernames.length === 1 
          ? `${typingUsernames[0]} is typing...`
          : `${typingUsernames.slice(0, -1).join(', ')} and ${typingUsernames.slice(-1)} are typing...`
        }
      </span>
    </div>
  );
};

// Chat Feed Component
const ChatFeed = () => {
  const { state } = useChat();
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [state.messages, state.typingUsers]);

  return (
    <div className="chat-feed">
      {state.messages.map((message) => (
        <Message
          key={message.id}
          message={message}
          isOwn={message.userId === 'currentUser'}
        />
      ))}
      <TypingIndicator />
      <div ref={messagesEndRef} />
    </div>
  );
};

// Message Input Component
const MessageInput = () => {
  const [message, setMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const { addMessage, setTyping } = useChat();

  useEffect(() => {
    if (message.trim() && !isTyping) {
      setIsTyping(true);
      if (Math.random() > 0.7) {
        const users = ['user1', 'user2', 'user3'];
        const randomUser = users[Math.floor(Math.random() * users.length)];
        setTyping(randomUser, true);
        setTimeout(() => setTyping(randomUser, false), 2000);
      }
    } else if (!message.trim() && isTyping) {
      setIsTyping(false);
    }
  }, [message, isTyping, setTyping]);

  const handleSubmit = (e) => {
    e?.preventDefault();
    if (message.trim()) {
      addMessage(message.trim());
      setMessage('');
      setIsTyping(false);
    }
  };

  return (
    <div className="message-input-container">
      <form className="message-input-form" onSubmit={handleSubmit}>
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Type your message..."
          className="message-input"
        />
        <button
          type="submit"
          disabled={!message.trim()}
          className="send-button"
        >
          <Send size={18} />
        </button>
      </form>
    </div>
  );
};

// User Component for Sidebar
const UserItem = ({ user }) => (
  <div className="user-item">
    <div className="user-avatar">
      {user.avatar}
      <div className={`status-indicator ${user.isOnline ? 'status-online' : 'status-offline'}`}></div>
    </div>
    <div className="user-info">
      <p className="user-name">{user.username}</p>
      <p className="user-status">
        {user.isOnline 
          ? 'Online' 
          : `Last seen ${Math.floor((Date.now() - user.lastSeen) / 60000)}m ago`}
      </p>
    </div>
  </div>
);

// Users Sidebar Component
const UsersSidebar = () => {
  const { state } = useChat();
  const users = Object.values(state.users).filter(user => user.id !== 'currentUser');
  const onlineCount = users.filter(user => user.isOnline).length;

  return (
    <div className="users-sidebar">
      <div className="sidebar-header">
        <h3 className="sidebar-title">Team Chat</h3>
        <p className="online-status">{onlineCount} of {users.length} online</p>
      </div>
      
      <div className="users-list-header">
        <User size={14} />
        <span>Members</span>
      </div>
      
      {users.map(user => <UserItem key={user.id} user={user} />)}
    </div>
  );
};

// Main Chat Application Component
const ChatApp = () => (
  <ChatProvider>
    <div className="chat-container">
      <div className="chat-main">
        <div className="chat-header">
          <h2 className="chat-title">Project Discussion</h2>
          <p className="chat-subtitle">Real-time team collaboration</p>
        </div>
        <ChatFeed />
        <MessageInput />
      </div>
      <UsersSidebar />
    </div>
  </ChatProvider>
);

export default ChatApp;