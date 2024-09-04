import CustomNavbar from "./components/CustomNavbar"
import Jumbo from "./components/Jumbo"
import MapTable from "./components/MapTable"
import { useState } from "react"

export default function App() {
  const [currentTable, setcurrentTable] = useState('weekly');
  const [currentTab, setcurrentTab] = useState('beatmaps');
  return(
    <div className="bg-osuslate-500 min-h-screen scrollbar scrollbar-thumb-osuslate-200 h-32 overflow-y-scroll">
      <CustomNavbar tab={currentTab} />
      <Jumbo tab={currentTab} currentTable = {currentTable} setcurrentTable = {setcurrentTable} />
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
    </div>
  );
}