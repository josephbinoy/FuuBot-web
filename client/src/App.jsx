import CustomNavbar from "./components/CustomNavbar"
import Jumbo from "./components/Jumbo"
import MapTable from "./components/MapTable"

export default function App() {
  return(
    <div className="bg-osuslate-500 min-h-screen scrollbar scrollbar-thumb-osuslate-200 h-32 overflow-y-scroll">
      <CustomNavbar />
      <Jumbo tab="Beatmaps"/>
      <MapTable />
    </div>
  );
}