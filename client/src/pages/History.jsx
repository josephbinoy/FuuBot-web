import CustomNavbar from "../components/CustomNavbar"
import MapCard from "../components/MapCard";
import HistoryTable from "../components/HistoryTable";
import { useEffect, useState } from "react";
import axios from "axios";
import { useParams, useNavigate, useLocation} from "react-router-dom";
import { ChevronLeftIcon } from "@heroicons/react/24/outline";
import SkeletonMapCard from "../skeletons/SkeletonMapCard";
import { useAlert } from "../context/AlertProvider";

export default function History() {
    const { setalertMsg } = useAlert();
    const [map, setMap] = useState({});
    const [totalCount, setTotalCount] = useState(null);
    const id = useParams().beatmapId;
    const navigate = useNavigate();
    const { state } = useLocation();
    useEffect(() => {
        const fetchData = async () => {
            try {
                if (!id) return;
                const response = await axios.get(`${import.meta.env.VITE_API_URL}/history/${id}`);
                setMap(response.data.beatmap);
                setTotalCount(response.data.alltimeCount);
            } catch (error) {
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
        <div className="relative bg-cover bg-center pb-44 pt-10" style={{
            backgroundImage: `url(https://assets.ppy.sh/beatmaps/${id}/covers/cover.jpg)`
        }}>
        <div className="absolute inset-0" style={{
            background: "linear-gradient(180deg, rgba(35, 39, 50, 1)5%, rgba(0, 0, 0, 0.5) 50%, rgba(35,39,50,1) 95%)"
            }}/>
            <div className="absolute inset-0 filter backdrop-blur-lg xl:backdrop-blur-xl" />
            <div className="relative mx-auto max-w-screen-xl flex items-center justify-between h-32 z-40">
                <button
                    onClick={() => {
                        const fromApp = state && state.fromApp;
                        if (fromApp) {
                            navigate(-1);
                            } else {
                            navigate('/');
                            }
                    }}
                    className="absolute -top-7 text-lg text-osuslate-100 font-bold flex items-center opacity-70"
                >
                    <ChevronLeftIcon className="opacity-80 h-5 w-5 mr-1" strokeWidth={3} />Back
                </button>
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
            <h1 className="absolute bottom-18 w-full text-3xl mx-auto text-gray-300 font-extrabold text-center leading-relaxed">
                This map has been picked by <span className="text-glow-200 text-4xl opacity-70">{totalCount}</span>{ ` player${totalCount == 1 ? '' : 's'}`} all time!
            </h1>}
        </div>
        <HistoryTable id={id} />
    </div>
  );
}