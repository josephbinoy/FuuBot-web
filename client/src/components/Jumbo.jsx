import { ButtonGroup, Button } from "@material-tailwind/react";
import { useDbv } from "../context/DbvProvider.jsx";
import axios from 'axios';
import { useEffect, useState } from "react";
import { useAlert } from "../context/AlertProvider.jsx";
import { Link } from "react-router-dom";
import { ChevronRightIcon } from "@heroicons/react/24/outline";
import { timeAgo } from "../utils/time";

export default function Jumbo({currentTable, setcurrentTable}) {
    const { setDbv } = useDbv();
    const { setalertMsg } = useAlert();
    const [lastUpdate, setLastUpdate] = useState(0);
    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await axios.get(`${import.meta.env.VITE_API_URL}/dbv`);
                setDbv(response.data.dbv);
                const updateLastUpdate = () => {
                    setLastUpdate(timeAgo(response.data.dbv)); //stale closure is okay :)
                };
                updateLastUpdate();
                const displayInterval = setInterval(updateLastUpdate, 60000);

                return () => clearInterval(displayInterval);
            } catch (error) {
                console.log('Error fetching stats:', error);
                setalertMsg("Error fetching data. Try disabling adblocker and try again")
            }
        };
        fetchData();
    }, []);
    return (
        <div className=" relative mx-auto max-w-screen-xl flex items-center justify-between h-40">
            <h1 className="text-5xl text-osuslate-50 font-black px-10">Popular Beatmaps</h1>
            {lastUpdate && <p className="fixed bottom-1 right-2 text-osuslate-100 text-sm font-bold opacity-80 z-20">{`Last updated ${lastUpdate}`}</p>}
            <ButtonGroup fullWidth ripple={false} size="lg" color="blue-gray">
                <Button onClick={() => setcurrentTable('weekly')}>
                    <p className={`${currentTable === 'weekly' && 'text-white -translate-y-px'}`}>weekly</p>
                </Button>
                <Button onClick={() => setcurrentTable('monthly')}>
                    <p className={`${currentTable === 'monthly' && 'text-white -translate-y-px'}`}>monthly</p>
                </Button>
                <Button onClick={() => setcurrentTable('yearly')}>
                    <p className={`${currentTable === 'yearly' && 'text-white -translate-y-px'}`}>yearly</p>
                </Button>
                <Button onClick={() => setcurrentTable('alltime')}>
                    <p className={`${currentTable === 'alltime' && 'text-white -translate-y-px'}`}>alltime</p>
                </Button>
            </ButtonGroup>
            <Link to="blacklist" className="absolute bottom-0 right-10 xl:right-1 text-osuslate-100 flex items-center opacity-70">View Blacklisted Maps <ChevronRightIcon className="h-5 w-5 ml-1 opacity-80" strokeWidth={3}/></Link>
        </div>
    )
}