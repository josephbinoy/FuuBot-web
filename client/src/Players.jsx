import CustomNavbar from "./components/CustomNavbar"
import LeaderBoard from "./components/LeaderBoard";
import { useState } from "react";

export default function History() {
  const [currentLeaderboard, setcurrentLeaderboard] = useState('weekly');
  return(
    <div className="bg-osuslate-500 min-h-screen scrollbar scrollbar-thumb-osuslate-200 h-32 overflow-y-auto">
        <CustomNavbar />
        <h1 className="mx-auto max-w-screen-xl text-5xl text-gray-300 font-black px-10 my-10">Player Leaderboard</h1>
        <div className="mx-auto max-w-screen-xl my-10 flex items-center justify-center">
          <div className="w-full" style={{ display: currentLeaderboard === 'alltime' ? 'block' : 'none' }}>
              <LeaderBoard period='alltime' currentLeaderboard={currentLeaderboard} setcurrentLeaderboard={setcurrentLeaderboard}/>
          </div>
          <div className="w-full" style={{ display: currentLeaderboard === 'weekly' ? 'block' : 'none' }}>
              <LeaderBoard period='weekly' currentLeaderboard={currentLeaderboard} setcurrentLeaderboard={setcurrentLeaderboard}/>
          </div>
        </div>
    </div>
  );
}