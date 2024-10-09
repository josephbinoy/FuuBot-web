import { ButtonGroup, Button } from "@material-tailwind/react";
import { useTable } from "../context/TableProvider.jsx";
import { Link } from "react-router-dom";
import { ChevronRightIcon } from "@heroicons/react/24/outline";
import BeatmapTip from "./BeatmapTip.jsx";
import axios from 'axios';
import { useEffect, useState } from "react";
import { Tooltip } from "@material-tailwind/react";

export default function Jumbo() {
    const { currentTable, setcurrentTable } = useTable();
    const [pickCounts, setPickCounts] = useState({
        weekly_count: 0,
        monthly_count: 0,
        yearly_count: 0,
        alltime_count: 0
    });
    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await axios.get(`${import.meta.env.VITE_API_URL}/pickcounts`);
                const counts = response.data;
                setPickCounts(counts);
            } catch (error) {
                console.log('Error fetching data:', error);
            }
        };

        fetchData();
    }, []);
    return (
        <div className=" relative mx-auto max-w-screen-xl flex items-center justify-between h-40">
            <div className="flex items-end justify-center px-12 gap-2">
                <h1 className="text-5xl text-gray-300 font-black">Popular<br />Beatmaps</h1>
                <BeatmapTip/>
            </div>
            <ButtonGroup fullWidth ripple={false} size="lg" color="blue-gray">
                <Button onClick={() => setcurrentTable('weekly')}>
                    <Tooltip placement="top" content={<p>Weekly Pick Count: {Number(pickCounts.weekly_count).toLocaleString()}</p>}>
                        <p className={`${currentTable === 'weekly' && 'text-gray-300 -translate-y-px'}`}>weekly</p>
                    </Tooltip>
                </Button>
                <Button onClick={() => setcurrentTable('monthly')}>
                    <Tooltip placement="top" content={<p>Monthly Pick Count: {Number(pickCounts.monthly_count).toLocaleString()}</p>}>
                        <p className={`${currentTable === 'monthly' && 'text-gray-300 -translate-y-px'}`}>monthly</p>
                    </Tooltip>
                </Button>
                <Button onClick={() => setcurrentTable('yearly')}>
                    <Tooltip placement="top" content={<p>Yearly Pick Count: {Number(pickCounts.yearly_count).toLocaleString()}</p>}>   
                        <p className={`${currentTable === 'yearly' && 'text-gray-300 -translate-y-px'}`}>yearly</p>
                    </Tooltip>
                </Button>
                <Button onClick={() => setcurrentTable('alltime')}>
                    <Tooltip placement="top" content={<p>All-time Pick Count: {Number(pickCounts.alltime_count).toLocaleString()}</p>}>
                        <p className={`${currentTable === 'alltime' && 'text-gray-300 -translate-y-px'}`}>alltime</p>
                    </Tooltip>
                </Button>
            </ButtonGroup>
            <Link to="blacklist" className="absolute bottom-0 right-10 xl:right-1 text-osuslate-100 flex items-center opacity-70 font-bold">View Blacklisted Maps <ChevronRightIcon className="h-5 w-5 ml-1 opacity-80" strokeWidth={3}/></Link>
        </div>
    )
}