import { useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { useTable } from "../context/TableProvider";
import CustomNavbar from "../components/CustomNavbar"
import Jumbo from "../components/Jumbo"
import MapTable from "../components/MapTable"

export default function Beatmaps() {
  const { currentTable, setcurrentTable } = useTable();
  const [searchParams, setSearchParams] = useSearchParams();
  useEffect(() => {
    if (searchParams.has('preset')) {
      const preset = searchParams.get('preset');
      if (preset === 'weekly' || preset === 'monthly' || preset === 'yearly' || preset === 'alltime') {
        setcurrentTable(preset);
      }
      setSearchParams({});
    }
  }, []);
  return(
    <div className="bg-osuslate-500 min-h-screen scrollbar scrollbar-thumb-osuslate-200 h-32 overflow-y-auto">
      <CustomNavbar />
      <Jumbo />
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