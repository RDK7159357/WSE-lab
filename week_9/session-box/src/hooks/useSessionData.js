import { useEffect, useState } from "react";
import axios from "axios";

export default function useSessionData() {
  const [data, setData] = useState(null);

  useEffect(() => {
    axios.get("http://localhost:8000/session.php")
      .then(res => setData(res.data))
      .catch(err => console.error("Session error", err));
  }, []);

  return data;
}
