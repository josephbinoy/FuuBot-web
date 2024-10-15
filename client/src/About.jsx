import CustomNavbar from "./components/CustomNavbar"
import StaminaChart from "./components/StaminaChart";
import { Link, useLocation} from "react-router-dom";
import { useEffect, useRef } from "react";
import { ChevronRightIcon } from "@heroicons/react/24/outline";

export default function About() {
    const location = useLocation();
    const staminaRef = useRef(null);
    useEffect(() => {
        if(location.hash === "#stamina") {
            staminaRef.current.scrollIntoView({ behavior: "smooth" });
        }
    }, [location]);
  return(
    <div className="bg-osuslate-500 min-h-screen scrollbar scrollbar-thumb-osuslate-200 h-32 overflow-y-auto">
        <CustomNavbar />
        <div className="relative mx-auto max-w-screen-xl flex items-center justify-between h-28 ">
            <Link to="/commands" className="absolute top-0 right-0 mt-2 text-lg text-osuslate-100 font-bold flex items-center opacity-70">
                View Command List<ChevronRightIcon className="opacity-80 h-5 w-5 mr-1" strokeWidth={3} />
            </Link>
            <h1 className="text-5xl text-gray-300 font-black px-10">About</h1>
        </div>
        <div className="flex flex-col mx-auto max-w-screen-xl px-10 text-gray-300 text-xl leading-relaxed" id="about">
            <h2 className="text-3xl font-black mb-5">What is FuuBot?</h2>
            <p className="text-3xl mx-auto my-8 font-black mb-5 text-transparent bg-clip-text bg-gradient-to-r from-glow-100 to-[#f09c78]">“The bridge between private and public lobby.”</p>
            <p className="mt-10"><span className="text-glow-100 font-bold opacity-90 text-2xl">FuuBot</span> is a unique osu! auto host rotate bot created by active osu! players in an attempt to improve the multi experience by moderating both players and maps while providing useful features.</p>
            <br />
            <p className="text-osuslate-50">(Disclaimer: This bot does not cater to everyone by design. The players who have a problem with it are precisely the kind of players we want to keep out.)</p>
            <br />
            <p>Problems FuuBot aims to solve that exist in every other bot: </p>
            <ul className="list-decimal list-inside indent-8">
                <li>Players picking the same 100 or so "overplayed" maps</li>
                <li>Forcing uncomfortable maps whether it be extremely high/low AR, too long, too stamina draining maps. </li>
                <li>Lobbies being filled with low rank players who pick low quality maps (not surprising considering there are roughly 18 million osu! accounts).</li>
            </ul>
        </div>
        <div ref={staminaRef} className="flex flex-col mx-auto max-w-screen-xl px-10 my-10 text-gray-300 text-xl leading-relaxed" id="stamina">
            <h2 className="text-3xl font-black mb-5">Stamina Limit?</h2>
            <p className="indent-10">Stamina is measured in <span className="text-glow-100">Circles Per Second or CPS</span> (technically Objects Per Second). We limit those maps that have a vey high CPS (mostly stream maps and maps with high note density)</p>
            <br />
            <p className="underline underline-offset-4">Hover over the chart below to check the stamina limit and maximum object count based on map length: </p>
            <StaminaChart />
            <img src="stamina_inst.png" alt="stamina instructions" className="w-8/12 mx-auto mt-10" />
            <p className="text-sm mx-auto mt-3">how to check object count</p>
            <p className="text-base my-5">Note: We use the map's hit length or drain length in calculations which is total length minus breaks however the difference is usually small</p>
            <img src="hit_length.png" className="w-60 mx-auto"></img>
            <p className="text-sm mx-auto mt-3">drain length</p>
        </div>
        <div className="flex flex-col mx-auto max-w-screen-xl px-10 text-gray-300 text-xl leading-relaxed" id="formula">
            <h2 className="text-3xl font-black mb-5">How is Stamina Limit Calculated?</h2>
            <p className="indent-10">Stamina limit is calculated using two simple formulas devised based on player feedback as follows: </p>
            <p>For 2 minutes and under: </p>
            <img src="under2.svg" alt="equation" className="w-[400px] mx-auto my-10" />
            <p>For over 2 minutes: </p>
            <img src="over2.svg" alt="equation" className="w-[440px] mx-auto my-10" />
            <p className="text-base mx-auto">where C = Stamina Constant, L = Map Length (in minutes)</p>
        </div>
        <div className="flex flex-col mx-auto max-w-screen-xl px-10 text-gray-300 text-xl my-10 leading-relaxed" id="popular">
          <h2 className="text-3xl font-black mb-5">Why does it ban popular maps?</h2>
            <p className="indent-10">Simple answer: To <span className="text-glow-100">diversify the multi map pool</span>. There are hundred of thousands of beatmaps out there but players tend to pick the same few maps. By banning popular maps, we encourage players to explore and pick maps they otherwise wouldn't. This gives more exposure to thousands of maps with low play count.</p>
            <h2 className="text-3xl font-black mt-10 mb-5">How does it work?</h2>
            <p className="indent-10">We keep track of each and every map a player picks, whether valid or not. You can view the stats on our <Link to="/" className="text-glow-100 underline underline-offset-4 hover:opacity-70">Beatmaps Page</Link>.</p>
            <br />
            <p className="mb-5">Maps are banned based on their <span className="text-glow-100">weekly, monthly, yearly or alltime pick counts.</span> The limits are calculated based on the total pick counts of all maps using the formulas as follows: </p>
            <ul className="list-decimal list-inside">
                <li>Weekly Limit</li>
                <img src="weekly.svg" alt="equation" className="w-[400px] mx-auto my-8" />
                <li>Monthly Limit</li>
                <img src="monthly.svg" alt="equation" className="w-[410px] mx-auto my-8" />
                <li>Yearly Limit</li>
                <img src="yearly.svg" alt="equation" className="w-[380px] mx-auto my-8" />
                <li>Alltime Limit</li>
                <img src="alltime.svg" alt="equation" className="w-[480px] mx-auto my-8" />
            </ul>
        </div>
        <div className="flex flex-col mx-auto max-w-screen-xl px-10 text-gray-300 text-xl my-10 mb-40 leading-relaxed" id="other">
            <h2 className="text-3xl font-black mb-5">Why does it ban some players?</h2>
            <p className="indent-10">Firstly, the ban is temporary. It disappears once the lobby restarts. Secondly, this ban is based on a minimum pp requirement, which is based on the star difficulty range of the lobby. Players who are under this requirement are banned.</p>
        </div>
    </div>
  )
}