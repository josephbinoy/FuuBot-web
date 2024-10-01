import {  HeartIcon, PlayCircleIcon } from "@heroicons/react/24/solid"
import { ChevronDoubleUpIcon, ArrowTopRightOnSquareIcon} from "@heroicons/react/24/outline";
export default function MapCard({mapId, mapName, mapArtist, mapper, mapperId, favoriteCount, playCount, status, submittedAt}) {
    const date = new Date(submittedAt).toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      });

    
    return (
      <div className="mx-auto max-w-screen-xl w-11/12 mb-8 mt-4 h-56 flex rounded-lg relative p-5 bg-cover bg-center overflow-hidden shadow-3xl"
        style={{
            backgroundImage: `url(https://assets.ppy.sh/beatmaps/${mapId}/covers/cover@2x.jpg)`,
        }}>
        <div className="absolute inset-0 bg-black opacity-60" />
        <StatusIcon status={status} />
        <a href={`https://osu.ppy.sh/beatmapsets/${mapId}`}><ArrowTopRightOnSquareIcon height={25} width={25} className="absolute bottom-3 right-3 text-gray-500" /></a>
        <div className="z-10 w-6/12 flex flex-col items-start justify-between">
            <div className="text-gray-300">
                <h1 className="text-4xl truncate font-extrabold">{mapName}</h1>
                <h2 className="text-lg truncate">{mapArtist}</h2>
                <div className="flex items-center justify-start">
                    <PlayCircleIcon height={20} width={20} /><p className= "text-sm ml-1 mr-3">{Number(playCount).toLocaleString()}</p>
                    <HeartIcon height={20} width={20} /><p className="text-sm ml-1">{Number(favoriteCount).toLocaleString()}</p>
                </div>
            </div>
            <div className="flex gap-2">
                <img src={`https://a.ppy.sh/${mapperId}`} className="w-12 h-12 rounded-lg opacity-80" />
                <div className="flex flex-col justify-center">                
                    <h3 className="font-bold text-sm text-gray-300">Mapped by {mapper}</h3>
                    <p className="font-bold text-xs text-gray-400">Submitted {date}</p>
                </div>
            </div>
        </div>
      </div>
    )
}

function QuestionMark(){
    return (
        <p className="font-extrabold text-5xl absolute top-3 right-4 text-white/70">?</p>
    )
}

function StatusIcon({status}){
    switch (status) {
        case "ranked":
            return <ChevronDoubleUpIcon height={30} width={30} strokeWidth={3} className="absolute top-3 right-3 text-[#8aecff]" />
        case "loved":
            return <HeartIcon height={30} width={30} className="absolute top-3 right-3 text-[#ff8acd]"/>
        case "graveyard":
        case "pending":
            return <QuestionMark />
        default: 
            return <></>
    }
}