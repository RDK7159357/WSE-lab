import React, { useState } from 'react';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import { useAuth } from '../../contexts/AuthContext';

const ChatRoomForm = () => {
  const [roomName, setRoomName] = useState('');
  const { user } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await addDoc(collection(db, 'rooms'), {
        name: roomName,
        createdAt: new Date(),
        createdBy: user.uid // Add the user's UID as createdBy
      });

      setRoomName('');
    } catch (err) {
      console.error('Error adding room:', err);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="chat-room-form">
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