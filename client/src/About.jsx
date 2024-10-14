import CustomNavbar from "./components/CustomNavbar"
import StaminaChart from "./components/StaminaChart";

export default function About() {
  return(
    <div className="bg-osuslate-500 min-h-screen scrollbar scrollbar-thumb-osuslate-200 h-32 overflow-y-auto">
        <CustomNavbar />
        <h1 className="text-5xl text-gray-300 font-black px-10 mx-auto max-w-screen-xl my-8">About</h1>
        <div className="flex flex-col mx-auto max-w-screen-xl px-10 text-gray-300 text-xl leading-relaxed" id="about">
            <h2 className="text-3xl font-black mb-5">What is FuuBot?</h2>
            <p className="text-3xl mx-auto my-8 font-black mb-5 text-transparent bg-clip-text bg-gradient-to-r from-glow-100 to-[#f09c78]">“The bridge between private and public lobby.”</p>
            <p className="indent-10 mt-10">FuuBot is a unique osu! auto host rotate bot created by active osu! players in an attempt to better the otherwise stale multi experience by moderating both players and maps while adding useful features.</p>
            <br />
            <p className="text-osuslate-50">(Disclaimer: This bot does not cater to everyone by design. The people who have a problem with it are exactly the type of people we want to keep out.)</p>
            <br />
            <p>Problems FuuBot aims to solve that exist in every other bot: </p>
            <ul className="list-decimal list-inside">
                <li>Playing the same 100 or so "overplayed" maps</li>
                <li>Forcing uncommon skillset maps whether it be extremely high/low AR, too long, too stamina draining maps. </li>
                <li>Lobbies being infested with low rank players who pick low quality maps. Not surprising considering there are 18M osu! accounts.</li>
            </ul>
        </div>
        <div className="flex flex-col mx-auto max-w-screen-xl px-10 my-10 text-gray-300 text-xl leading-relaxed" id="chart">
            <h2 className="text-3xl font-black mb-5">Stamina Limit?</h2>
            <p className="indent-10">Stamina is measured in Circles Per Second or CPS (technically Objects Per Second). We limit those maps that have a vey high CPS (mostly stream maps and maps with high note density)</p>
            <br />
            <p >Use the interactive chart to check the stamina limit and maximum allowed object count based on map length: </p>
            <StaminaChart />
        </div>
        <div className="flex flex-col mx-auto max-w-screen-xl px-10 text-gray-300 text-xl" id="formula">
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
            <p className="indent-10">Simple answer: To diversify the multi map pool. There are hundred of thousands of beatmaps out there but players like to pick the same fraction of maps. </p>
            <br />
            <p>By banning popular maps, we encourage players to explore and pick maps they would otherwise not pick. This not only gives exposure to thousands of maps with low play count but also leads to uncovering of "hidden gems" of maps.</p>
            <h2 className="text-3xl font-black mt-10 mb-5">How does it work?</h2>
            <p className="indent-10">We keep track of each and every map a player picks, whether valid or not. You can view the stats on our homepage.</p>
            <br />
            <p className="mb-5">Maps are banned based on their weekly, monthly, yearly or alltime pick counts. These limits are calculated based on the total pick counts of all maps using the formulas as follows: </p>
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
            <p className="indent-10">Firstly, the ban is temporary. The ban disappears once the lobby restarts. Secondly, this ban is based on a minimum pp requirement, which is based on the star difficulty range of the lobby. Players who are under this requirement are banned.</p>
        </div>
    </div>
  )
}