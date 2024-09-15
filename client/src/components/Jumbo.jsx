import { ButtonGroup, Button } from "@material-tailwind/react";
import { useTable } from "../context/TableProvider.jsx";
import { Link } from "react-router-dom";
import { ChevronRightIcon } from "@heroicons/react/24/outline";
import Tooltip from "./ToolTip.jsx";

export default function Jumbo() {
    const { currentTable, setcurrentTable } = useTable();
    return (
        <div className=" relative mx-auto max-w-screen-xl flex items-center justify-between h-40">
            <div className="flex items-end justify-center px-10 gap-2">
                <h1 className="text-5xl text-gray-300 font-black">Popular<br />Beatmaps</h1>
                <Tooltip/>
            </div>
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