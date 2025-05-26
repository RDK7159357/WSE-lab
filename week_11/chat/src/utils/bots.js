// Bot personalities and response patterns
const botPersonalities = {
  techBot: {
    id: 'bot1',
    username: 'TechBot',
    avatar: '🤖',
    topics: ['programming', 'technology', 'coding', 'software', 'development', 'app'],
    responses: [
      'Have you tried turning it off and on again?',
      'That sounds like a great use case for React hooks!',
      'You might want to consider using a different data structure for that.',
      'The latest update to that framework has some impressive performance improvements.',
      'I recommend checking the documentation for edge cases.',
      'That\'s a common issue with asynchronous operations.',
    ],
    greetings: [
      'Hello! Need any tech help today?',
      'Hi there! What are you coding today?',
      'Greetings! Any technical challenges I can help with?'
    ]
  },
  designBot: {
    id: 'bot2',
    username: 'DesignPro',
    avatar: '👩‍🎨',
    topics: ['design', 'UI', 'UX', 'color', 'layout', 'interface', 'user experience'],
    responses: [
      'Have you considered a more minimalist approach?',
      'Color theory suggests that combination might not be optimal for accessibility.',
      'User testing would be valuable for that interaction pattern.',
      'That layout could benefit from better visual hierarchy.',
      'White space is your friend in that design.',
      'Consider the user journey through that flow.',
    ],
    greetings: [
      'Hello! Looking for design inspiration?',
      'Hi there! Need help with your UI/UX?',
      'Greetings! Let\'s make something beautiful today!'
    ]
  },
  projectBot: {
    id: 'bot3',
    username: 'ProjectManager',
    avatar: '👨‍💼',
    topics: ['project', 'deadline', 'timeline', 'team', 'management', 'planning', 'schedule'],
    responses: [
      'Let\'s set up a meeting to discuss that further.',
      'We should add that to our sprint backlog.',
      'What\'s your timeline for completing that task?',
      'Have you updated the project board with your progress?',
      'We need to prioritize features for the next release.',
      'Let\'s break that down into smaller, manageable tasks.',
    ],
    greetings: [
      'Hello team! How\'s the project coming along?',
      'Hi there! Any blockers I can help with today?',
      'Greetings! Let\'s check our project milestones.'
    ]
  }
};

// Generate a response based on message content and bot personality
const generateBotResponse = (message, botType) => {
  const bot = botPersonalities[botType];
  if (!bot) return null;
  
  const messageText = message.content.toLowerCase();
  
  // Check if this is the first message in a while (greeting)
  const isNewConversation = Math.random() > 0.7;
  if (isNewConversation) {
    return {
      id: Date.now().toString(),
      userId: bot.id,
      username: bot.username,
      avatar: bot.avatar,
      content: bot.greetings[Math.floor(Math.random() * bot.greetings.length)],
      timestamp: Date.now(),
      type: 'text'
    };
  }
  
  // Check if message contains topics relevant to this bot
  const relevantTopic = bot.topics.some(topic => messageText.includes(topic));
  if (relevantTopic || Math.random() > 0.7) {
    return {
      id: Date.now().toString(),
      userId: bot.id,
      username: bot.username,
      avatar: bot.avatar,
      content: bot.responses[Math.floor(Math.random() * bot.responses.length)],
      timestamp: Date.now(),
      type: 'text'
    };
  }
  
  return null;
};

// Simulate typing indicator for bots
const simulateBotTyping = (botType, setTyping) => {
  const bot = botPersonalities[botType];
  if (!bot) return;
  
  // Simulate typing for 1-3 seconds
  setTyping(bot.id, true);
  setTimeout(() => setTyping(bot.id, false), 1000 + Math.random() * 2000);
};

// Get all bot users for the initial state
const getBotUsers = () => {
  const botUsers = {};
  
  Object.values(botPersonalities).forEach(bot => {
    botUsers[bot.id] = {
      id: bot.id,
      username: bot.username,
      avatar: bot.avatar,
      isOnline: Math.random() > 0.3, // Randomly set online status
      lastSeen: Date.now() - Math.floor(Math.random() * 30) * 60000 // Random last seen in the last 30 minutes
    };
  });
  
  return botUsers;
};

export { generateBotResponse, simulateBotTyping, getBotUsers, botPersonalities };