import React, { useState, useEffect } from 'react';
import { collection, query, orderBy, onSnapshot, doc, deleteDoc, getDocs, writeBatch } from 'firebase/firestore';
import { db } from '../../firebase';
import { useAuth } from '../../contexts/AuthContext';

const Sidebar = ({ onSelectRoom }) => {
  const [rooms, setRooms] = useState([]);
  const { user } = useAuth();

  useEffect(() => {
    const q = query(collection(db, 'rooms'), orderBy('name'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setRooms(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    return unsubscribe;
  }, []);

  const handleDeleteRoom = async (e, roomId) => {
    e.stopPropagation(); // Prevent room selection when clicking delete
    
    if (window.confirm('Are you sure you want to delete this room?')) {
      try {
        // Debug: Check if user is authenticated
        console.log('Current user:', user ? user.uid : 'Not authenticated');
        
        // First, delete all messages in the room
        const messagesRef = collection(db, 'rooms', roomId, 'messages');
        const messagesSnapshot = await getDocs(messagesRef);
        
        // Create a batch to delete all messages
        const batch = writeBatch(db);
        messagesSnapshot.docs.forEach((doc) => {
          batch.delete(doc.ref);
        });
        
        // Commit the batch delete for messages
        if (messagesSnapshot.docs.length > 0) {
          await batch.commit();
        }
        
        // Then delete the room itself
        await deleteDoc(doc(db, 'rooms', roomId));
        console.log('Room and all messages successfully deleted');
      } catch (error) {
        console.error('Error deleting room:', error);
        console.error('Error code:', error.code);
        console.error('Error message:', error.message);
        alert(`Failed to delete room: ${error.message}`);
      }
    }
  };

  return (
    <div className="sidebar">
      <h3>Rooms</h3>
      <ul>
        {rooms.map(room => (
          <li key={room.id} className="room-item">
            <span onClick={() => onSelectRoom(room.id)}>{room.name}</span>
            {/* Only show delete button if user created the room or if createdBy is not set */}
            {(room.createdBy === user.uid || !room.createdBy) && (
              <button 
                className="delete-room-btn" 
                onClick={(e) => handleDeleteRoom(e, room.id)}
                aria-label="Delete room"
              >
                ×
              </button>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Sidebar;