import CustomNavbar from "./components/CustomNavbar"
import BlackItem from "./components/BlackItem"
import SkeletonItem from "./skeletons/SkeletonItem";
import axios from "axios"
import { useState, useEffect } from "react";
import { ChevronLeftIcon } from "@heroicons/react/24/outline";
import { Link } from "react-router-dom";
import { useAlert } from "./context/AlertProvider";

export default function Blacklist() {
    const [rows, setRows] = useState([null, null, null, null, null, null, null, null, null, null]);
    const [dataEnd, setDataEnd] = useState(false);
    const { setalertMsg } = useAlert();
    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await axios.get(`${import.meta.env.VITE_API_URL}/blacklist`);
                const newRows = response.data;
                if (newRows.length === 0) {
                    setRows(prevRows => prevRows.filter(row => row !== null));
                    setDataEnd(true);
                    return;
                }
                setRows([...newRows]);
                setDataEnd(true);
            } catch (error) {
                setRows(prevRows => prevRows.filter(row => row !== null));
                setalertMsg("Error fetching data");
            }
        };

        fetchData();
    }, []);
  return(
    <div className="bg-osuslate-500 min-h-screen scrollbar scrollbar-thumb-osuslate-200 h-32 overflow-y-auto">
        <CustomNavbar />
        <div className="relative mx-auto max-w-screen-xl flex items-center justify-between h-40">
            <Link to="/" className="absolute top-0 left-0 mt-3 text-lg text-osuslate-100 font-bold flex items-center opacity-70">
                <ChevronLeftIcon className="opacity-80 h-5 w-5 mr-1" strokeWidth={3} />Back
            </Link>
            <h1 className="text-5xl text-gray-300 font-black px-12 mt-7">Blacklisted Beatmaps</h1>
        </div>
        <div className="flex flex-col">
            {rows.map((row, index) => 
                <div key={index} className="flex items-center justify-center gap-4 mx-auto max-w-screen-xl w-11/12 my-2">
                <p className="text-xl text-gray-300 font-bold min-w-8 text-center">{index+1}</p>
                {row ? 
                <BlackItem 
                    mapId={row.beatmapId} 
                    mapName={row.t} 
                    mapArtist={row.a} 
                    mapper={row.m} /> : 
                <SkeletonItem type="blacklist"/>}
                </div>)}
            {dataEnd && <p className="mx-auto text-osuslate-100 font-visby font-bold text-xl mb-4">End of Data</p>}
        </div>
    </div>
  );
}