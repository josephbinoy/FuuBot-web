import { Tooltip } from "@material-tailwind/react";
import { QuestionMarkCircleIcon, EqualsIcon } from "@heroicons/react/16/solid";
 
export default function BeatmapTip() {
  return (
    <Tooltip placement="right"
      content={
        <div className="w-64 flex flex-col gap-3 opacity-80">
          <p>This page shows the most popular maps based on in-game pick counts</p>
          <p>Pick counts have limits and if a map crosses these limits, it will be rejected in-game</p>
          <p className="flex items-center gap-1"><span className="inline-block h-6 w-2 bg-red-500 rounded-sm" /><EqualsIcon className="h-4 w-4" strokeWidth={3} />Rejected</p>
          <p className="flex items-center gap-1"><span className="inline-block h-6 w-2 bg-orange-500 rounded-sm" /><EqualsIcon className="h-4 w-4" strokeWidth={3} />Near limit</p>
          <p className="flex items-center gap-1"><span className="inline-block h-6 w-2 bg-green-500 rounded-sm" /><EqualsIcon className="h-4 w-4" strokeWidth={3} />Safe</p>
          <p className="flex items-center gap-1"><span className="inline-block h-6 w-2 bg-black rounded-sm" /><EqualsIcon className="h-4 w-4" strokeWidth={3} />Blacklisted</p>
        </div>
      }
    >
    <QuestionMarkCircleIcon className="h-8 w-8 text-gray-300 pb-1"/>
    </Tooltip>
  );
}