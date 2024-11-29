import { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';

const TableContext = createContext();

export const TableProvider = ({ children }) => {
  const [currentTable, setcurrentTable] = useState('weekly');
  const [pickLimits, setPickLimits] = useState({
    weeklyLimit: 0,
    monthlyLimit: 0,
    yearlyLimit: 0,
    alltimeLimit: 0
  });
  const [renderedTables, setRenderedTables] = useState({ weekly: false, monthly: false, yearly: false, alltime: false });
  useEffect(() => {
    const fetchData = async () => {
        try {
            const response = await axios.get(`${import.meta.env.VITE_API_URL}/limits`);
            if (response.data)
              setPickLimits(response.data);
        } catch (error) {
            console.log('Error fetching limits:', error);
        }
    };
    fetchData();
}, []);

  return (
    <TableContext.Provider value={{ currentTable, setcurrentTable, pickLimits, renderedTables, setRenderedTables }}>
      {children}
    </TableContext.Provider>
  );
};

export const useTable = () => useContext(TableContext);