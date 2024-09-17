import { createContext, useState, useContext } from "react";
import { Alert } from "@material-tailwind/react";

const AlertContext = createContext();

export function AlertProvider({ children }) {
  const [alertMsg, setalertMsg] = useState(""); 

  return (
    <AlertContext.Provider value={{ alertMsg, setalertMsg }}>
      {children}
      <Alert
        className="absolute bottom-3 left-3 z-[999]"
        open={alertMsg !== ""}
        color="blue-gray"
        onClose={() => setalertMsg("")}
        animate={{
        mount: { y: 0 },
        unmount: { y: -20 },
      }}>
        {alertMsg}
      </Alert>
    </AlertContext.Provider>
  );
}


export function useAlert() {
  return useContext(AlertContext);
}