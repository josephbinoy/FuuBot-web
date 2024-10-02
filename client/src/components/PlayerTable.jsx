import PlayerMapItem from "./PlayerMapItem";
import SkeletonPlayerMapItem from "../skeletons/SkeletonPlayerMapItem";
import axios from 'axios';
import { useDbv } from "../context/DbvProvider";
import { useEffect, useState, useRef } from 'react';
import { useAlert } from "../context/AlertProvider";

export default function PlayerTable({ id }) {
    const [rows, setRows] = useState([null, null, null, null, null, null, null, null, null, null, null, null, null, null, null]);
    const [pageNo, setPageNo] = useState(0);
    const { setalertMsg } = useAlert();
    const [dataEnd, setDataEnd] = useState(false);
    const observer = useRef();
    const { dbv } = useDbv();
    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await axios.get(`${import.meta.env.VITE_API_URL}/profile/picks/${id}`, {
                    params: { pageNo, dbv: dbv }
                });
                const newRows = response.data;
                if (newRows.length < 15) {
                    if (observer.current) {
                        observer.current.disconnect();
                    }
                    setRows(prevRows => {
                        const filteredRows = prevRows.filter(row => row !== null);
                        return [...filteredRows, ...newRows];
                    });
                    setDataEnd(true);
                    return;
                }
                setRows(prevRows => {
                    const filteredRows = prevRows.filter(row => row !== null);
                    return [...filteredRows, ...newRows];
                });
            } catch (error) {
                if (observer.current) {
                    observer.current.disconnect();
                }
                setRows(prevRows => prevRows.filter(row => row !== null));
                console.log('Error fetching data:', error);
                if(!error.response){
                    setalertMsg("Server under maintenance. Please try again later")
                    return;
                }
                if(error.response.data.error==='dbv mismatch'){
                    setalertMsg("Database updated! Refresh the page for fresh data")
                }
                else if(error.response.data.error==='Incompatible page requested'){
                    setalertMsg("Error fetching data. Try disabling adblocker and try again")
                }
                else if(error.response.status===502){
                    setalertMsg("Server under maintenance. Please try again later")
                }
                else {
                    setalertMsg("Error fetching data. Please try again later")
                }
            }
        };

        fetchData();
    }, [pageNo]);

    useEffect(() => {
        const options = {
            root: null,
            rootMargin: '0px',
            threshold: 1.0
        };

        observer.current = new IntersectionObserver((entries) => {
            if (entries[0].isIntersecting) {
                setRows(prevRows => [...prevRows, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null]);
                setPageNo(prevPageNo => prevPageNo + 1);
            }
        }, options);

        const currentObserver = observer.current;
        const sentinel = document.querySelector(`#player-sentinel`);
        if (sentinel) {
            currentObserver.observe(sentinel);
        }

        return () => {
            if (sentinel) {
                currentObserver.unobserve(sentinel);
            }
        };
    }, []);

    return (
        <div className="flex flex-col">
            <p className="text-osuslate-100 font-bold pb-2 sticky bg-osuslate-500 z-30 top-62">Pick History</p>
            {rows.map((row, index) => 
                row ? <PlayerMapItem 
                    key={index} 
                    mapId={row.BEATMAP_ID} 
                    mapName={row.t} 
                    mapArtist={row.a} 
                    mapper={row.m} 
                    pickDate={row.PICK_DATE} /> : 
                <SkeletonPlayerMapItem key={index}/>)}
            <div id={`player-sentinel`} className="h-1"></div>
            {dataEnd && <p className="mx-auto text-osuslate-100 font-visby font-bold text-lg mb-4">End of Data</p>}
        </div>
    );
}