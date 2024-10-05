import PlayerMapItem from "./PlayerMapItem";
import SkeletonPlayerMapItem from "../skeletons/SkeletonPlayerMapItem";
import axios from 'axios';
import { useDbv } from "../context/DbvProvider";
import { useEffect, useState, useRef } from 'react';
import { useAlert } from "../context/AlertProvider";
import { timeAgo } from "../utils/time";

export default function PlayerTable({ id }) {
    const [rows, setRows] = useState([null, null, null, null, null, null, null, null, null, null, null, null, null, null, null]);
    const [pageNo, setPageNo] = useState(0);
    const { setalertMsg } = useAlert();
    const [dataEnd, setDataEnd] = useState(false);
    const observer = useRef();
    const { dbv } = useDbv();
    let previousPickDate = null;
    let isFirstGroup = false;
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
            <div className="sticky top-62 z-30 pb-2 bg-osuslate-500">
                <p className="text-osuslate-100 font-bold pb-2">Pick History</p>
                <hr className="border-osuslate-100 border-2 w-full border-opacity-50" />
            </div>
            {rows.map((row, index) => {
                let showPickDate = false;
                let currentPickDate = null;
                if (row){
                    currentPickDate = timeAgo(row.PICK_DATE);
                    showPickDate = currentPickDate !== previousPickDate;
                    if (previousPickDate === null) {
                        isFirstGroup = true;
                    }
                    else {
                        isFirstGroup = false;
                    }
                    previousPickDate = currentPickDate;
                }
                return row ? (
                    <div key={index} className="mb-4">
                        {showPickDate && (
                            <p className={`text-osuslate-100 font-bold pb-4 text-lg ${isFirstGroup ? "mt-2" : "mt-20"}`}>{currentPickDate}</p>
                        )}
                        <PlayerMapItem
                            mapId={row.BEATMAP_ID}
                            mapName={row.t}
                            mapArtist={row.a}
                            mapper={row.m}
                        />
                    </div>
                ) : (
                    <SkeletonPlayerMapItem key={index} />
                );
            })}
            <div id={`player-sentinel`} className="h-1"></div>
            {dataEnd && <p className="mx-auto text-osuslate-100 font-visby font-bold text-lg mb-4">End of Data</p>}
        </div>
    );
}