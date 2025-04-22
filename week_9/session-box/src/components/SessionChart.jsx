import { useEffect, useState } from 'react';

export default function SessionChart() {
  const [data, setData] = useState(null);

  useEffect(() => {
    fetch('http://localhost:8000/session.php', {
      method: 'GET',
      credentials: 'include', // 👈 include cookies
      cache: 'no-store'       // 👈 prevent caching
    })
      .then(res => res.json())
      .then(setData)
      .catch(console.error);
  }, []);

  return (
    <div>
      {data ? (
        <>
          <p>Views: {data.views}</p>
          <p>Timestamp: {data.timestamp}</p>
        </>
      ) : (
        <p>Loading session data...</p>
      )}
    </div>
  );
}
