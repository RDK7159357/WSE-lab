import React, { useState, useEffect } from 'react';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import { useAuth } from '../../contexts/AuthContext';

const ChatRoomForm = () => {
  const [roomName, setRoomName] = useState('');
  const [error, setError] = useState('');
  const { user } = useAuth();
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Check authentication status
  useEffect(() => {
    if (user) {
      console.log('User authenticated:', user.uid);
      setIsAuthenticated(true);
    } else {
      console.log('User not authenticated');
      setIsAuthenticated(false);
    }
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!user) {
      setError('You must be logged in to create a room');
      return;
    }

    try {
      // Debug: Check if user is authenticated
      console.log('Creating room as user:', user.uid);
      
      // Create the room document
      await addDoc(collection(db, 'rooms'), {
        name: roomName,
        createdAt: new Date(),
        createdBy: user.uid // Add the user's UID as createdBy
      });

      console.log('Room created successfully');
      setRoomName('');
    } catch (err) {
      console.error('Error adding room:', err);
      console.error('Error code:', err.code);
      console.error('Error message:', err.message);
      setError(`Failed to create room: ${err.message}`);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="chat-room-form">
      {error && <div className="error">{error}</div>}
      {!isAuthenticated && <div className="error">You must be logged in to create rooms</div>}
      <input
        type="text"
        placeholder="Enter room name"
        value={roomName}
        onChange={(e) => setRoomName(e.target.value)}
        required
        disabled={!isAuthenticated}
      />
      <button type="submit" disabled={!isAuthenticated}>Create Room</button>
    </form>
  );
};

export default ChatRoomForm;