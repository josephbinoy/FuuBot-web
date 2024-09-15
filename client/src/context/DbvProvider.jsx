import { createContext, useState, useContext, useEffect } from "react";
import axios from 'axios';
import { timeAgo } from "../utils/time";
import { useAlert } from "./AlertProvider.jsx";
const DbvContext = createContext();

export function DbvProvider({ children }) {
  const { setalertMsg } = useAlert();
  const [dbv, setDbv] = useState(-1); 
  const [lastUpdate, setlastUpdate] = useState(null);
  useEffect(() => {
    const fetchData = async () => {
        try {
            const response = await axios.get(`${import.meta.env.VITE_API_URL}/dbv`);
            setDbv(response.data.dbv);
            const updatelastUpdate = () => {
                setlastUpdate(timeAgo(response.data.dbv)); //stale closure is okay :)
            };
            updatelastUpdate();
            const displayInterval = setInterval(updatelastUpdate, 60000);

            return () => clearInterval(displayInterval);
        } catch (error) {
            console.log('Error fetching stats:', error);
            setalertMsg("Error fetching data. Try disabling adblocker and try again")
        }
    };
    fetchData();
}, []);
  return (
    <DbvContext.Provider value={{ dbv, setDbv }}>
      {children}
      {lastUpdate && <p className="fixed bottom-1 right-2 text-osuslate-100 text-sm font-bold opacity-80 z-20">{`Last updated ${lastUpdate}`}</p>}
    </DbvContext.Provider>
  );
}


export function useDbv() {
  return useContext(DbvContext);
}