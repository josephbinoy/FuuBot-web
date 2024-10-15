import { 
    Tabs,
    TabsHeader,
    TabsBody,
    Tab,
    TabPanel, } from "@material-tailwind/react";
import CustomNavbar from "./components/CustomNavbar";
import CommandTable from "./components/CommandTable";
import { useState } from "react";
 
const playerCommands = [
    {
      command: "!ask <question>",
      description: "Ask the bot any question. It can be about the lobby or osu in general.",
    },
    {
      command: "!timeleft",
      description: "Shows how much time is left for current match to end.",
    },
    {
      command: "!ms",
      description: "Shows map statistics like number of picks and who picked it last.",
    },
    {
      command: "!rs",
      description: "Shows player's most recent score stats.",
    },
    {
      command: "!skills <username>",
      description: "Shows the player's osu!skills statistics along with useful player stats",
    },
    {
      command: "!q or !queue",
      description: "Shows host queue.",
    },
    {
      command: "!skip",
      description: "Triggers vote to skip current host.",
    },
    {
      command: "!start",
      description: "Triggers vote start the match.",
    },
    {
      command: "!abort",
      description: "Triggers vote abort the match. Use when the match is stuck.",
    },
    {
      command: "!update",
      description: "Updates current selected map to the latest version. Use when a host picks an outdated map.",
    },
    {
      command: "!r or !regulation",
      description: "Shows any current regulations.",
    },
    {
      command: "!mirror",
      description: "Request mirror link for current map.",
    },
    {
      command: "!info or !help",
      description: "Show information about the bot.",
    },
    {
      command: "!commands",
      description: "Sends a PM to player with link to command list.",
    }
  ];
 
const hostCommands = [
    {
        command: "!skip",
        description: "Transfers host to next player in the queue.",
      },
      {
        command: "!start [seconds]",
        description: "Starts the match after a set time in seconds. Example: !start 30",
      },
      {
        command: "!stop",
        description: "Stops active start timer.",
      },
      {
        command: "!abort",
        description: "Aborts the currently running match.",
      },
      {
        command: "!force",
        description: "Override detection and force pick any map within regulation. Maximum 3 chances.",
      },
    ]
export default function Commands() {
    const [activeTab, setActiveTab] = useState("player");
  return (
    <div className="bg-osuslate-500 min-h-screen scrollbar scrollbar-thumb-osuslate-200 h-32 overflow-y-auto">
        <CustomNavbar />
        <h1 className="mx-auto max-w-screen-xl text-5xl text-gray-300 font-black px-10 my-8">Lobby Commands</h1>
        <Tabs value={activeTab} className='mx-auto max-w-screen-xl'>
            <TabsHeader
              className="rounded-none bg-transparent px-14 w-fit whitespace-nowrap"
              indicatorProps={{
                className:
                  "bg-transparent border-b-4 border-gray-300 rounded-none w-1/2 mx-auto",
              }}
            >
                <Tab
                  value="player"
                  onClick={() => setActiveTab("player")}
                  className={activeTab === "player" ? "text-gray-300 -translate-y-px text-2xl font-bold pb-2" : "text-osuslate-100 text-2xl font-bold"}
                >
                  Player Commands
                </Tab>
                <Tab
                  value="host"
                  onClick={() => setActiveTab("host")}
                  className={activeTab === "host" ? "text-gray-300 -translate-y-px text-2xl font-bold pb-2" : "text-osuslate-100 text-2xl font-bold"}
                >
                  Host Commands
                </Tab>
            </TabsHeader>
            <TabsBody>
                <TabPanel value="player">
                <div className="mx-auto max-w-screen-xl flex items-center justify-center">
                    <CommandTable TABLE_ROWS={playerCommands} />
                </div>
                </TabPanel>
                <TabPanel value="host">
                  <div className="mx-auto max-w-screen-xl flex items-center justify-center">
                    <CommandTable TABLE_ROWS={hostCommands} />
                  </div>
                </TabPanel>
            </TabsBody>
            </Tabs>
    </div>
  );
}