import CustomNavbar from "./components/CustomNavbar"
import MapCard from "./components/MapCard";
import PlayerCard from "./components/PlayerCard";
import SkeletonPlayerCard from "./skeletons/SkeletonPlayerCard";
import { useEffect, useState } from "react";
import axios from "axios";
import { useParams, Link } from "react-router-dom";
import { ChevronLeftIcon } from "@heroicons/react/24/outline";
import SkeletonMapCard from "./skeletons/SkeletonMapCard";
import { useAlert } from "./context/AlertProvider";

export default function History() {
    const [data, setData] = useState([null, null, null, null, null]);
    const { setalertMsg } = useAlert();
    const [map, setMap] = useState({});
    const [totalCount, setTotalCount] = useState(null);
    const id = useParams().beatmapId;
    useEffect(() => {
        const fetchData = async () => {
            try {
                if (!id) return;
                const response = await axios.get(`${import.meta.env.VITE_API_URL}/history/${id}`);
                setMap(response.data.beatmap);
                setTotalCount(response.data.alltimeCount);
                if (response.data.history.length === 0) {
                    setData(prevData => prevData.filter(d => d !== null));
                    return;
                }
                setData(response.data.history);
            } catch (error) {
                setData(prevData => prevData.filter(d => d !== null));
                if(error.response.data.error === "Beatmap not found") {         
                    setalertMsg("This beatmap has never been picked in the lobby!");
                }
                else{
                    setalertMsg("Error fetching data");
                }
            }
        };
        fetchData();
    }, []);
  return(
    <div className="bg-osuslate-500 min-h-screen scrollbar scrollbar-thumb-osuslate-200 h-32 overflow-y-auto">
        <CustomNavbar />
        <div className="relative bg-cover bg-center pb-48 pt-10" style={{
            backgroundImage: `url(https://assets.ppy.sh/beatmaps/${id}/covers/cover.jpg)`
        }}>
        <div className="absolute inset-0" style={{
            background: "linear-gradient(180deg, rgba(35, 39, 50, 1)5%, rgba(0, 0, 0, 0.5) 50%, rgba(35,39,50,1) 95%)"
            }}/>
            <div className="absolute inset-0 filter backdrop-blur-lg xl:backdrop-blur-xl" />
            <div className="relative mx-auto max-w-screen-xl flex items-center justify-between h-32 ">
                <Link to="/" className="absolute -top-6 text-lg text-osuslate-100 font-bold flex items-center opacity-70">
                    <ChevronLeftIcon className="opacity-80 h-5 w-5 mr-1" strokeWidth={3} />Back
                </Link>
                <h1 className="text-5xl text-gray-300 font-black px-10 mb-2">Beatmap History</h1>
            </div>
            {map.t ? <MapCard 
                mapId={id} 
                mapName={map.t}
                mapArtist={map.a}
                mapper={map.m} 
                mapperId={map.mid} 
                favoriteCount={map.fc} 
                playCount={map.pc} 
                status={map.s} 
                submittedAt={map.sdate}
            />: <SkeletonMapCard />}
            {totalCount &&
            <h1 className="absolute bottom-16 w-full text-3xl mx-auto text-gray-300 font-extrabold text-center">
                This map has been picked by <span className="text-glow-200 text-4xl opacity-70">{data.length}</span>{ ` player${data.length == 1 ? '' : 's'}` }<br />this week
                and <span className="text-glow-200 text-4xl opacity-70">{totalCount}</span>{ ` player${totalCount == 1 ? '' : 's'}`} all time
            </h1>}
        </div>
        <div className="flex flex-col gap-3 mx-auto max-w-screen-lg px-10 pb-10">
            {data.length>0 && <p className="text-osuslate-100 font-bold pl-12">This week</p>}
            {data.map((row, index) => 
                row ? <div className="flex items-center justify-between gap-1" key={index}>
                <p className="text-2xl text-gray-300 w-10 text-center">{index+1}</p>
                <div className="flex-grow">
                    <PlayerCard 
                        id={row.id} 
                        name={row.n} 
                        country={row.con}
                        rank={row.gr}
                        pickDate={row.pickDate} 
                        coverUrl={row.cv} 
                    />
                </div></div>:
                <div className="flex items-center justify-between gap-1">
                    <p className="text-2xl text-gray-300 min-w-10 text-center" />
                    <div className="flex-grow">
                        <SkeletonPlayerCard key={index} />
                    </div>
                </div>
                
            )}
        </div>
    </div>
  );
}