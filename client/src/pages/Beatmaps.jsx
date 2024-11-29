import { useEffect, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import { useTable } from "../context/TableProvider";
import CustomNavbar from "../components/CustomNavbar"
import Jumbo from "../components/Jumbo"
import MapTable from "../components/MapTable"

export default function Beatmaps() {
  const { currentTable, setcurrentTable, renderedTables, setRenderedTables } = useTable();
  const [searchParams, setSearchParams] = useSearchParams();
  const pageSize = useRef(Math.ceil(window.innerHeight / 100));

  useEffect(() => {
    if (searchParams.has('preset')) {
      const preset = searchParams.get('preset');
      if (preset === 'weekly' || preset === 'monthly' || preset === 'yearly' || preset === 'alltime') {
        setcurrentTable(preset);
        setRenderedTables(prev => ({ ...prev, [preset]: true }));
      }
      setSearchParams({});
    }
    else {
      setRenderedTables(prev => ({ ...prev, weekly: true }));
    }
  }, []);
  return(
    <div className="bg-osuslate-500 min-h-screen scrollbar scrollbar-thumb-osuslate-200 h-32 overflow-y-auto">
      <CustomNavbar />
      <Jumbo />
      {renderedTables.weekly && (
      <div style={{ display: currentTable === 'weekly' ? 'block' : 'none' }}>
        <MapTable key='weekly' tableType='weekly' pageSize={pageSize.current}/>
      </div>
      )}
      {renderedTables.monthly && (
      <div style={{ display: currentTable === 'monthly' ? 'block' : 'none' }}>
        <MapTable key='monthly' tableType='monthly' pageSize={pageSize.current}/>
      </div>
      )}
      {renderedTables.yearly && (
      <div style={{ display: currentTable === 'yearly' ? 'block' : 'none' }}>
        <MapTable key='yearly' tableType='yearly' pageSize={pageSize.current}/>
      </div>
      )}
      {renderedTables.alltime && (
      <div style={{ display: currentTable === 'alltime' ? 'block' : 'none' }}>
        <MapTable key='alltime' tableType='alltime' pageSize={pageSize.current}/>
      </div>
      )}
    </div>
  );
}