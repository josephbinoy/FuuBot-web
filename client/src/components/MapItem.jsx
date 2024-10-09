import { Link } from 'react-router-dom';
import { useTable } from '../context/TableProvider.jsx';

export default function MapItem({mapId, mapName, mapArtist, mapper, weeklyCount=0, monthlyCount=0, yearlyCount=0, alltimeCount=0}) {
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

    return (
      <Link to={`history/${mapId}`} state={{ fromApp: true }} className="w-full">
        <div
          className={`relative flex items-center justify-between h-20 rounded-lg px-6 pr-3 font-visby font-bold text-2xl text-opacity-80 shadow-lg text-gray-100 border-r-4 ${borderColorClass} hover:-translate-y-0.5 hover:shadow-2xl transition-all duration-300 hover:opacity-80 overflow-hidden`}>
            <div
                className="absolute inset-0 bg-cover bg-center transition-transform duration-500 hover:scale-105"
                style={{
                    backgroundImage: `linear-gradient(to right, rgba(0, 0, 0, 0.7) 20%, rgba(0, 0, 0, 0.4) 70%, rgba(0, 0, 0, 0.8) 100%), url(https://assets.ppy.sh/beatmaps/${mapId}/covers/slimcover.jpg)`,
                }}
            />
            <div className="w-6/12 flex flex-col gap-1 z-10 pointer-events-none">
              <h2 className="truncate w-full">{mapName}</h2>
              <div className="text-xs flex items-center w-full">
                <p className="truncate">{mapArtist} •<span className="text-gray-500"> Mapped by {mapper}</span></p>
              </div>
            </div>
            <div className='flex items-center justify-center divide-x-1 divide-gray-300 divide-opacity-30'>
              <p className={`relative z-10 pointer-events-none w-12 h-10 flex items-end justify-center ${getPickCountColor(weeklyCount, weeklyLimit)}`}><span className='text-2xs absolute -top-1 text-gray-300 opacity-70'>W</span>{weeklyCount}</p>
              <p className={`relative z-10 pointer-events-none w-12 h-10 flex items-end justify-center ${getPickCountColor(monthlyCount, monthlyLimit)}`}><span className='text-2xs absolute -top-1 text-gray-300 opacity-70'>M</span>{monthlyCount}</p>
              <p className={`relative z-10 pointer-events-none w-12 h-10 flex items-end justify-center ${getPickCountColor(yearlyCount, yearlyLimit)}`}><span className='text-2xs absolute -top-1 text-gray-300 opacity-70'>Y</span>{yearlyCount}</p>
              <p className={`relative z-10 pointer-events-none w-12 h-10 flex items-end justify-center ${getPickCountColor(alltimeCount, alltimeLimit)}`}><span className='text-2xs absolute -top-1 text-gray-300 opacity-70'>A</span>{alltimeCount}</p>
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