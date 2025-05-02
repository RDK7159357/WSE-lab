import React, { useState } from 'react';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '../../firebase';

const ChatRoomForm = () => {
  const [roomName, setRoomName] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await addDoc(collection(db, 'rooms'), {
        name: roomName,
        createdAt: new Date()
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