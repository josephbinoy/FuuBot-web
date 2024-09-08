import CustomNavbar from "./components/CustomNavbar"
import Jumbo from "./components/Jumbo"
import MapTable from "./components/MapTable"
import { useState } from "react"
import { Alert } from "@material-tailwind/react";
import { useAlert } from "./context/AlertProvider";

export default function Beatmaps() {
  const [currentTable, setcurrentTable] = useState('weekly');
  const { alertMsg, setalertMsg } = useAlert();
  return(
    <div className="bg-osuslate-500 min-h-screen scrollbar scrollbar-thumb-osuslate-200 h-32 overflow-y-scroll">
      <CustomNavbar />
      <Jumbo currentTable = {currentTable} setcurrentTable = {setcurrentTable} />
      <div style={{ display: currentTable === 'weekly' ? 'block' : 'none' }}>
        <MapTable tableType='weekly'/>
      </div>
      <div style={{ display: currentTable === 'monthly' ? 'block' : 'none' }}>
        <MapTable tableType='monthly'/>
      </div>
      <div style={{ display: currentTable === 'yearly' ? 'block' : 'none' }}>
        <MapTable tableType='yearly'/>
      </div>
      <div style={{ display: currentTable === 'alltime' ? 'block' : 'none' }}>
        <MapTable tableType='alltime'/>
      </div>
      <Alert
        className="absolute bottom-3 left-3"
        open={alertMsg !== ""}
        color="blue-gray"
        onClose={() => setalertMsg("")}
        animate={{
        mount: { y: 0 },
        unmount: { y: -20 },
      }}>
        {alertMsg}
      </Alert>
    </div>
  );
}