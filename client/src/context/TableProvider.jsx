import { createContext, useState, useContext } from 'react';

const TableContext = createContext();

export const TableProvider = ({ children }) => {
  const [currentTable, setcurrentTable] = useState('weekly');

  return (
    <TableContext.Provider value={{ currentTable, setcurrentTable }}>
      {children}
    </TableContext.Provider>
  );
};

export const useTable = () => useContext(TableContext);