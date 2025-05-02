import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { collection, query, orderBy, onSnapshot, addDoc, doc, updateDoc } from 'firebase/firestore';
import { db, auth } from '../../firebase';
import { useAuth } from '../../contexts/AuthContext';

const Chat = () => {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const { user } = useAuth();

  useEffect(() => {
    const q = query(
      collection(db, 'rooms', roomId, 'messages'),
      orderBy('timestamp', 'asc')
    );
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setMessages(snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        timestamp: doc.data().timestamp?.toDate().toLocaleTimeString()
      })));
    });

    return unsubscribe;
  }, [roomId]);

  const sendMessage = async (e) => {
    e.preventDefault();
    if (newMessage.trim()) {
      await addDoc(collection(db, 'rooms', roomId, 'messages'), {
        text: newMessage,
        sender: user.email,
        timestamp: new Date()
      });
      setNewMessage('');
    }
  };

  const handleExit = () => {
    navigate('/dashboard');
  };

  return (
    <div className="chat-container">
      <div className="chat-header">
        <h3>Room #{roomId}</h3>
        <button className="exit-button" onClick={handleExit}>Exit Room</button>
      </div>
      <div className="messages-container">
        {messages.map((msg) => (
          <div 
            key={msg.id} 
            className={`message ${msg.sender === user.email ? 'sent' : 'received'}`}
          >
            <strong>{msg.sender}</strong>
            <span>{msg.timestamp}</span>
            <p>{msg.text}</p>
          </div>
        ))}
      </div>
      <form onSubmit={sendMessage} className="message-form">
        <input
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type a message..."
        />
        <button type="submit">Send</button>
      </form>
    </div>
  );
};

export default Chat;