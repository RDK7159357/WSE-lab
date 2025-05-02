import React, { useState } from 'react';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import { useAuth } from '../../contexts/AuthContext';

const ChatRoomForm = () => {
  const [roomName, setRoomName] = useState('');
  const [error, setError] = useState('');
  const { user } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      // Debug: Check if user is authenticated
      console.log('Current user:', user ? user.uid : 'Not authenticated');
      
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
      <input
        type="text"
        placeholder="Enter room name"
        value={roomName}
        onChange={(e) => setRoomName(e.target.value)}
        required
      />
      <button type="submit">Create Room</button>
    </form>
  );
};

export default ChatRoomForm;