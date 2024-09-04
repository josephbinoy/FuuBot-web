import { createContext, useState, useContext } from "react";

const DbvContext = createContext();

export function DbvProvider({ children }) {
  const [dbv, setDbv] = useState(-1); 

  return (
    <DbvContext.Provider value={{ dbv, setDbv }}>
      {children}
    </DbvContext.Provider>
  );
}


export function useDbv() {
  return useContext(DbvContext);
}