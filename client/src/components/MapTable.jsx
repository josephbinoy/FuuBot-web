import MapItem from "./MapItem";
import BlackItem from "./BlackItem";
import SkeletonItem from "../skeletons/SkeletonItem";
import axios from 'axios';
import { useDbv } from "../context/DbvProvider";
import { useEffect, useState, useRef } from 'react';
import { useAlert } from "../context/AlertProvider";

export default function MapTable( { tableType }) {
    const [rows, setRows] = useState([null, null, null, null, null, null, null, null, null, null]);
    const [pageNo, setPageNo] = useState(0);
    const { setalertMsg } = useAlert();
    const [dataEnd, setDataEnd] = useState(false);
    const observer = useRef();
    const { dbv } = useDbv();
    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await axios.get(`${import.meta.env.VITE_API_URL}/beatmaps/${tableType}`, {
                    params: { pageNo, dbv: dbv }
                });
                const newRows = response.data;
                if (newRows.length === 0) {
                    if (observer.current) {
                        observer.current.disconnect();
                    }
                    setRows(prevRows => prevRows.filter(row => row !== null));
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
        const sentinel = document.querySelector(`#${tableType}-sentinel`);
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
        <div className="flex flex-col mt-1">
            {rows.map((row, index) => 
                row ? row.isBlacklisted ? <BlackItem 
                    key={index} 
                    mapId={row.BEATMAP_ID} 
                    mapName={row.t} 
                    mapArtist={row.a} 
                    mapper={row.m} 
                    weeklyCount={row.weekly_count}
                    monthlyCount={row.monthly_count}
                    yearlyCount={row.yearly_count}
                    alltimeCount={row.alltime_count}
                /> :
                <MapItem 
                    key={index} 
                    mapId={row.BEATMAP_ID} 
                    mapName={row.t} 
                    mapArtist={row.a} 
                    mapper={row.m} 
                    weeklyCount={row.weekly_count}
                    monthlyCount={row.monthly_count}
                    yearlyCount={row.yearly_count}
                    alltimeCount={row.alltime_count} />: 
                <SkeletonItem key={index} type="popular"/>)}
            <div id={`${tableType}-sentinel`} className="h-1"></div>
            {dataEnd && <p className="mx-auto text-osuslate-100 font-visby font-bold text-xl mb-4">End of Data</p>}
        </div>
    );
}