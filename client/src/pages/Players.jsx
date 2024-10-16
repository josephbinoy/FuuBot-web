import CustomNavbar from "../components/CustomNavbar"
import LeaderBoard from "../components/LeaderBoard";
import SideBoard from "../components/SideBoard";
import { useState } from "react";
import {
  Tabs,
  TabsHeader,
  TabsBody,
  Tab,
  TabPanel,
} from "@material-tailwind/react";

export default function History() {
  const [currentLeaderboard, setcurrentLeaderboard] = useState('weekly');
  const [activeTab, setActiveTab] = useState("mostpicks");
  return(
    <div className="bg-osuslate-500 min-h-screen scrollbar scrollbar-thumb-osuslate-200 h-32 overflow-y-scroll">
        <CustomNavbar />
        <h1 className="mx-auto max-w-screen-xl text-5xl text-gray-300 font-black px-10 my-8">Player Leaderboards</h1>
        <Tabs value={activeTab} className='mx-auto max-w-screen-xl'>
            <TabsHeader
              className="rounded-none bg-transparent px-14 w-fit whitespace-nowrap"
              indicatorProps={{
                className:
                  "bg-transparent border-b-4 border-gray-300 rounded-none w-1/2 mx-auto",
              }}
            >
                <Tab
                  value="mostpicks"
                  onClick={() => setActiveTab("mostpicks")}
                  className={activeTab === "mostpicks" ? "text-gray-300 -translate-y-px text-2xl font-bold pb-2" : "text-osuslate-100 text-2xl font-bold"}
                >
                  Most Picks
                </Tab>
                <Tab
                  value="unique"
                  onClick={() => setActiveTab("unique")}
                  className={activeTab === "unique" ? "text-gray-300 -translate-y-px text-2xl font-bold pb-2" : "text-osuslate-100 text-2xl font-bold"}
                >
                  Unique Pickers
                </Tab>
                <Tab
                  value="overplayed"
                  onClick={() => setActiveTab("overplayed")}
                  className={activeTab === "overplayed" ? "text-gray-300 -translate-y-px text-2xl font-bold pb-2" : "text-osuslate-100 text-2xl font-bold"}
                >
                  Overplayed Pickers
                </Tab>
            </TabsHeader>
            <TabsBody>
                <TabPanel value="mostpicks">
                <div className="mx-auto max-w-screen-xl flex items-center justify-center">
                  <div className="w-full" style={{ display: currentLeaderboard === 'alltime' ? 'block' : 'none' }}>
                      <LeaderBoard period='alltime' currentLeaderboard={currentLeaderboard} setcurrentLeaderboard={setcurrentLeaderboard}/>
                  </div>
                  <div className="w-full" style={{ display: currentLeaderboard === 'weekly' ? 'block' : 'none' }}>
                      <LeaderBoard period='weekly' currentLeaderboard={currentLeaderboard} setcurrentLeaderboard={setcurrentLeaderboard}/>
                  </div>
                </div>
                </TabPanel>
                <TabPanel value="unique">
                <div className="mx-auto max-w-screen-xl flex items-center justify-center">
                    <SideBoard type="unique"/>
                </div>
                </TabPanel>
                <TabPanel value="overplayed">
                  <div className="mx-auto max-w-screen-xl flex items-center justify-center">
                      <SideBoard type="overplayed"/>
                  </div>
                </TabPanel>
            </TabsBody>
          </Tabs>
    </div>
  );
}