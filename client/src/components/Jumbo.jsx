import { ButtonGroup, Button } from "@material-tailwind/react";
import { useTable } from "../context/TableProvider.jsx";
import { Link } from "react-router-dom";
import { ChevronRightIcon } from "@heroicons/react/24/outline";
import { EqualsIcon } from "@heroicons/react/16/solid";

export default function Jumbo() {
    const { currentTable, setcurrentTable } = useTable();
    return (
        <div className=" relative mx-auto max-w-screen-xl flex items-center justify-between h-44">
            <div className="flex items-end justify-center pl-10 pr-5 gap-12">
                <h1 className="text-5xl text-gray-300 font-black">Popular<br />Beatmaps</h1>
                <div className="flex flex-col items-start gap-2 text-osuslate-50 opacity-80 mb-2">
                    <p>Maps are ranked based on in-game pick count. If a map crosses set limits, it will be rejected in-game</p>
                    <div className="flex items-center justify-center gap-8 font-bold">
                        <p className="flex items-center gap-1"><span className="inline-block min-h-6 min-w-2 bg-green-500 rounded-sm" /><EqualsIcon className="h-4 w-4" strokeWidth={3} />Safe</p>
                        <p className="flex items-center gap-1"><span className="inline-block min-h-6 min-w-2 bg-orange-500 rounded-sm" /><EqualsIcon className="h-4 w-4" strokeWidth={3} />Near limit</p>
                        <p className="flex items-center gap-1"><span className="inline-block min-h-6 min-w-2 bg-red-500 rounded-sm" /><EqualsIcon className="h-4 w-4" strokeWidth={3} />Rejected</p>
                        <p className="flex items-center gap-1"><span className="inline-block min-h-6 min-w-2 bg-black rounded-sm" /><EqualsIcon className="h-4 w-4" strokeWidth={3} />Blacklisted</p>
                    </div>
                </div>
            </div>
            <ButtonGroup ripple={false} size="md" color="blue-gray" className="absolute bottom-0 right-4">
                <Button onClick={() => setcurrentTable('weekly')} className="p-0 w-12 h-8">
                    <p className={`${currentTable === 'weekly' && 'text-gray-300 -translate-y-px'}`}>W</p>
                </Button>
                <Button onClick={() => setcurrentTable('monthly')} className="p-0 w-12 h-8">
                    <p className={`${currentTable === 'monthly' && 'text-gray-300 -translate-y-px'}`}>M</p>
                </Button>
                <Button onClick={() => setcurrentTable('yearly')} className="p-0 w-12 h-8">
                    <p className={`${currentTable === 'yearly' && 'text-gray-300 -translate-y-px'}`}>Y</p>
                </Button>
                <Button onClick={() => setcurrentTable('alltime')} className="p-0 w-12 h-8">
                    <p className={`${currentTable === 'alltime' && 'text-gray-300 -translate-y-px'}`}>A</p>
                </Button>
            </ButtonGroup>
            <Link to="blacklist" className="absolute top-4 right-6 text-osuslate-100 flex items-center opacity-60 font-bold">View All Blacklisted Maps <ChevronRightIcon className="h-5 w-5 ml-1 opacity-80" strokeWidth={3}/></Link>
        </div>
    )
}