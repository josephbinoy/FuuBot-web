import PlayerCard from "../components/PlayerCard";
import SkeletonPlayerCard from "../skeletons/SkeletonPlayerCard";
import axios from 'axios';
import { useDbv } from "../context/DbvProvider";
import { useEffect, useState, useRef } from 'react';
import { useAlert } from "../context/AlertProvider";
import { timeAgo, getDateString, timeAgoLarge } from "../utils/time";

export default function HistoryTable( { id }) {
    const [rows, setRows] = useState([null, null, null, null, null, null, null, null, null, null]);
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
                const response = await axios.get(`${import.meta.env.VITE_API_URL}/history/players/${id}`, {
                    params: { pageNo, dbv: dbv }
                });
                const newRows = response.data;
                if (newRows.length < 10) {
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
                setRows(prevRows => [...prevRows, null, null, null, null, null, null, null, null, null, null]);
                setPageNo(prevPageNo => prevPageNo + 1);
            }
        }, options);

        const currentObserver = observer.current;
        const sentinel = document.querySelector(`#history-sentinel`);
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
        <div className="flex flex-col gap-4 mx-auto max-w-screen-lg px-10 pb-10">
        {rows.map((row, index) => {
                let showPickDate = false;
                let currentPickDate = null;
                let cardDate = '';
                if (row){
                    currentPickDate = timeAgoLarge(row.pickDate);
                    cardDate = currentPickDate === 'Past week' ? timeAgo(row.pickDate) : getDateString(row.pickDate);
                    showPickDate = currentPickDate !== previousPickDate;
                    if (previousPickDate === null) {
                        isFirstGroup = true;
                    }
                    else {
                        isFirstGroup = false;
                    }
                    previousPickDate = currentPickDate;
                }
            return row ? 
            <div key={index}>
            {showPickDate && (<p className={`text-osuslate-100 pl-12 font-bold pb-4 text-lg ${isFirstGroup ? "mt-2" : "mt-20"}`}>{currentPickDate}</p>
            )}
            <div className="flex items-center justify-between gap-1">
            <p className="text-2xl text-gray-300 w-10 text-center">{index+1}</p>
            <div className="flex-grow">
                <PlayerCard 
                    id={row.id} 
                    name={row.n} 
                    country={row.con_c}
                    rank={row.gr}
                    playTime={row.pt}
                    pickCount={row.pickCount}
                    pickDate={cardDate} 
                    coverUrl={row.cv} 
                />
            </div>
            </div></div>:
            <div className="flex items-center justify-between gap-1" key={index}>
                <p className="text-2xl text-gray-300 min-w-10 text-center" />
                <div className="flex-grow">
                    <SkeletonPlayerCard key={index} idx={index}/>
                </div>
            </div>
        })}
        <div id={`history-sentinel`} className="h-1"></div>
        {dataEnd && <p className="mx-auto text-osuslate-100 font-visby font-bold text-lg">End of Data</p>}
    </div>
    )
}