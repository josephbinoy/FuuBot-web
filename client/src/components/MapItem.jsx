import { Link, useLocation } from 'react-router-dom';
import { useTable } from '../context/TableProvider.jsx';
import { useEffect, useState } from 'react';

export default function MapItem({mapId, mapName, mapArtist, mapper, tableType, weeklyCount=0, monthlyCount=0, yearlyCount=0, alltimeCount=0}) {
  const { pickLimits } = useTable();
  const weeklyLimit = pickLimits.weeklyLimit;
  const monthlyLimit = pickLimits.monthlyLimit;
  const yearlyLimit = pickLimits.yearlyLimit;
  const alltimeLimit = pickLimits.alltimeLimit;
  
  const counts = [
      { count: weeklyCount, limit: weeklyLimit },
      { count: monthlyCount, limit: monthlyLimit },
      { count: yearlyCount, limit: yearlyLimit },
      { count: alltimeCount, limit: alltimeLimit }
    ];

    let borderColorClass = 'border-green-500';

    for (const { count, limit } of counts) {
      if (count >= limit) {
          borderColorClass = 'border-red-500';
          break;
      } else if (count >= limit * 0.75) {
          borderColorClass = 'border-orange-500';
      }
    }

    const [backgroundLoaded, setBackgroundLoaded] = useState(false);

    useEffect(() => {
      const img = new Image();
      img.src = `https://assets.ppy.sh/beatmaps/${mapId}/covers/slimcover.jpg`;
      img.onload = () => setBackgroundLoaded(true);
    }, []);

    const { pathname } = useLocation();

    return (
      <Link to={`/history/${mapId}`} state={{ fromApp: true }} className="w-full" reloadDocument={pathname.startsWith("/history")}>
        <div
          className={`relative flex items-center justify-between h-20 rounded-lg px-6 pr-3 font-visby font-bold text-2xl text-opacity-80 shadow-lg text-gray-100 border-r-4 ${borderColorClass} hover:-translate-y-0.5 hover:shadow-2xl transition-all duration-300 hover:opacity-80 overflow-hidden`}>
            <div
              className={`absolute inset-0 ${backgroundLoaded ? 'bg-cover bg-center transition-transform duration-500 hover:scale-105' : 'animate-pulse-fast bg-osuslate-100'}`}
              style={{
                backgroundImage: `linear-gradient(to right, rgba(0, 0, 0, 0.7) 20%, rgba(0, 0, 0, 0.4) 70%, rgba(0, 0, 0, 0.8) 100%)${
                              backgroundLoaded ? `, url(https://assets.ppy.sh/beatmaps/${mapId}/covers/slimcover.jpg)` : ''}`
              }}
            />
            <div className="w-8/12 flex flex-col gap-1 z-10 pointer-events-none">
              <h2 className="truncate max-w-[600px] xl:max-w-[750px] w-full">{mapName}</h2>
              <div className="text-xs flex items-center w-full">
                <p className="truncate">{mapArtist} •<span className="text-gray-500"> Mapped by {mapper}</span></p>
              </div>
            </div>
            <div className='flex items-center justify-center divide-x-1 divide-gray-300 divide-opacity-30'>
              <p className={`relative z-10 pointer-events-none w-12 h-10 flex items-end justify-center ${getPickCountColor(weeklyCount, weeklyLimit)} ${tableType==='weekly' || tableType==='none'?'':'opacity-60'}`}><span className={`text-2xs absolute -top-1 text-gray-300`}>W</span>{weeklyCount}</p>
              <p className={`relative z-10 pointer-events-none w-12 h-10 flex items-end justify-center ${getPickCountColor(monthlyCount, monthlyLimit)} ${tableType==='monthly' || tableType==='none'?'':'opacity-60'}`}><span className={`text-2xs absolute -top-1 text-gray-300`}>M</span>{monthlyCount}</p>
              <p className={`relative z-10 pointer-events-none w-12 h-10 flex items-end justify-center ${getPickCountColor(yearlyCount, yearlyLimit)} ${tableType==='yearly' || tableType==='none'?'':'opacity-60'}`}><span className={`text-2xs absolute -top-1 text-gray-300`}>Y</span>{yearlyCount}</p>
              <p className={`relative z-10 pointer-events-none w-12 h-10 flex items-end justify-center ${getPickCountColor(alltimeCount, alltimeLimit)} ${tableType==='alltime' || tableType==='none'?'':'opacity-60'}`}><span className={`text-2xs absolute -top-1 text-gray-300`}>A</span>{alltimeCount}</p>
            </div>
        </div>
      </Link>
    )
}

function getPickCountColor(count, limit) {
  if (count >= limit) {
    return 'text-red-400';
  } else if (count >= limit * 0.75) {
    return 'text-orange-400';
  } else {
    return 'text-green-400';
  }
}