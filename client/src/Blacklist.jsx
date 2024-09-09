import CustomNavbar from "./components/CustomNavbar"
import BlackItem from "./components/BlackItem"
import { SkeletonItem } from "./components/SkeletonItem";
import axios from "axios"
import { useState, useEffect } from "react";
import { ChevronLeftIcon } from "@heroicons/react/24/outline";
import { Link } from "react-router-dom";

export default function Blacklist() {
    const [rows, setRows] = useState([null, null, null, null, null, null, null, null, null, null]);
    const [dataEnd, setDataEnd] = useState(false);
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
                console.log('Error fetching data:', error);
            }
        };

        fetchData();
    }, []);
  return(
    <div className="bg-osuslate-500 min-h-screen scrollbar scrollbar-thumb-osuslate-200 h-32 overflow-y-scroll">
        <CustomNavbar />
        <div className="relative mx-auto max-w-screen-xl flex items-center justify-between h-40">
            <Link to="/" className="absolute top-0 left-0 mt-3 text-lg text-osuslate-100 font-extrabold flex items-center opacity-70">
                <ChevronLeftIcon className="opacity-80 h-5 w-5 mr-1" strokeWidth={3} />Back
            </Link>
            <h1 className="text-5xl text-osuslate-50 font-black px-10">Blacklisted Beatmaps</h1>
        </div>
        <div className="flex flex-col">
            {rows.map((row, index) => row ? <BlackItem key={index} mapId={row.BEATMAP_ID} mapName={row.t} mapArtist={row.a} mapper={row.m} imageUrl={`https://assets.ppy.sh/beatmaps/${row.BEATMAP_ID}/covers/slimcover.jpg`}/> : <SkeletonItem key={index} type="blacklist"/>)}
            {dataEnd && <p className="mx-auto text-osuslate-100 font-visby font-bold text-xl mb-4">End of Data</p>}
        </div>
    </div>
  );
}