import CustomNavbar from "./components/CustomNavbar"
import ProfileCard from "./components/ProfileCard"
import PlayerTable from "./components/PlayerTable";
import { useParams, useNavigate, useLocation} from "react-router-dom";
import { ChevronLeftIcon } from "@heroicons/react/24/outline";

export default function Profile() {
    const id = useParams().playerId;
    const navigate = useNavigate();
    const { state } = useLocation();
  return(
    <div className="bg-osuslate-500 min-h-screen scrollbar scrollbar-thumb-osuslate-200 h-32 overflow-y-auto">
        <CustomNavbar classes="sticky top-0 z-20"/>
        <div className="sticky top-22 mx-auto max-w-screen-xl flex items-center justify-between h-40 z-30 bg-osuslate-500">
                <button
                    onClick={() => {
                        const fromApp = state && state.fromApp;
                        if (fromApp) {
                            navigate(-1);
                            } else {
                            navigate('/');
                            }
                    }}
                    className="absolute top-0 left-0 mt-3 text-lg text-osuslate-100 font-bold flex items-center opacity-70"
                >
                    <ChevronLeftIcon className="opacity-80 h-5 w-5 mr-1" strokeWidth={3} />Back
                </button>
            <h1 className="text-5xl text-gray-300 font-black px-10 mt-5">Player Profile</h1>
        </div>
        <div className="mx-auto max-w-screen-xl flex items-start justify-center gap-5 pr-5">
            <div className="sticky top-62 w-5/12 flex flex-col items-center justify-start">
                <p className="text-osuslate-100 w-10/12 font-bold pl-1 pb-2">Player Info</p>
                <ProfileCard id={id}/>
            </div>
            <div className="w-7/12">
                <PlayerTable id={id}/>
            </div>
        </div>
    </div>
  );
}