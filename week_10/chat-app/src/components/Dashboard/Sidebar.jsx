import React, { useState, useEffect } from 'react';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '../../firebase';

const Sidebar = ({ onSelectRoom }) => {
  const [rooms, setRooms] = useState([]);

  useEffect(() => {
    const q = query(collection(db, 'rooms'), orderBy('name'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setRooms(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    return unsubscribe;
  }, []);

  return (
    <div className="sidebar">
      <h3>Rooms</h3>
      <ul>
        {rooms.map(room => (
          <li key={room.id} onClick={() => onSelectRoom(room.id)}>
            {room.name}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Sidebar;