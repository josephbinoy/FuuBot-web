import { createContext, useState, useContext } from "react";

const AlertContext = createContext();

export function AlertProvider({ children }) {
  const [alertMsg, setalertMsg] = useState(""); 

  return (
    <AlertContext.Provider value={{ alertMsg, setalertMsg }}>
      {children}
    </AlertContext.Provider>
  );
}


export function useAlert() {
  return useContext(AlertContext);
}