import { ButtonGroup, Button } from "@material-tailwind/react";
import { useDbv } from "../context/DbvProvider.jsx";
import axios from 'axios';
import { useEffect, useState } from "react";

export function timeAgo(timestamp) {
    const dateString = new Date(timestamp * 1000).toISOString();
    const createdDate = new Date(dateString);
    const now = Date.now();
    const diffInMs = now - createdDate.getTime();

    const seconds = Math.floor(diffInMs / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    const months = Math.floor(days / 30);
    const years = Math.floor(days / 365);

    if (years > 0) {
        return `${years} years ago`;
    } else if (months > 0) {
        return `${months} months ago`;
    } else if (days > 0) {
        return `${days} days ago`;
    } else if (hours > 0) {
        return `${hours} hours ago`;
    } else if (minutes > 0) {
        return `${minutes} minutes ago`;
    } else {
        return `${seconds} seconds ago`;
    }
}
export default function Jumbo({tab, currentTable, setcurrentTable}) {
    const { dbv, setDbv } = useDbv();
    const [lastUpdate, setLastUpdate] = useState(0);
    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await axios.get(`http://localhost:3000/api/stats`);
                setDbv(response.data.dbv);
                const updateLastUpdate = () => {
                    setLastUpdate(timeAgo(response.data.dbv));
                };
                updateLastUpdate();
                setInterval(updateLastUpdate, 60000);
            } catch (error) {
                console.log('Error fetching stats:', error);
            }
        };
        fetchData();
    }, []);
    return (
        <div className="mx-auto max-w-screen-xl flex items-center justify-between h-40">
            <h1 className="text-4xl text-osuslate-50 font-black px-10">Popular {tab}</h1>
            <p className="absolute  bottom-1 right-2 text-osuslate-100 text-sm font-bold opacity-80">{dbv!=-1 && `Last updated ${lastUpdate}`}</p>
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
        </div>
    )
}