import { Link } from 'react-router-dom';

export default function MapItem({mapId, mapName, mapArtist, mapper, weeklyCount=0, monthlyCount=0, yearlyCount=0, alltimeCount=0}) {
  const weeklyLimit = import.meta.env.VITE_WEEKLY_LIMIT;
  const monthlyLimit = import.meta.env.VITE_MONTHLY_LIMIT;
  const yearlyLimit = import.meta.env.VITE_YEARLY_LIMIT;
  const alltimeLimit = import.meta.env.VITE_ALLTIME_LIMIT;
  
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
      <Link to={`history/${mapId}`} state={{ fromApp: true }} className="mx-auto max-w-screen-xl w-11/12 my-2">
        <div
          className={`relative flex items-center justify-between h-20 rounded-lg px-6 pr-3 font-visby font-bold text-2xl text-opacity-80 shadow-lg text-white border-r-4 ${borderColorClass} hover:-translate-y-0.5 hover:shadow-2xl transition-all duration-300 hover:opacity-80 overflow-hidden`}>
            <div
                className="absolute inset-0 bg-cover bg-center transition-transform duration-500 hover:scale-105"
                style={{
                    backgroundImage: `linear-gradient(to right, rgba(0, 0, 0, 0.7) 20%, rgba(0, 0, 0, 0.4) 70%, rgba(0, 0, 0, 0.7) 100%), url(https://assets.ppy.sh/beatmaps/${mapId}/covers/slimcover.jpg)`,
                }}
            />
            <div className="w-6/12 flex flex-col gap-1 z-10 pointer-events-none">
              <h2 className="truncate w-full">{mapName}</h2>
              <div className="text-xs flex items-center w-full">
                <p className="truncate">{mapArtist} •<span className="text-gray-500"> Mapped by {mapper}</span></p>
              </div>
            </div>
            <div className='flex items-center justify-center divide-x-1 divide-gray-300 divide-opacity-30'>
              <p className={`z-10 pointer-events-none w-12 h-10 flex items-center justify-center ${getPickCountColor(weeklyCount, weeklyLimit)}`}>{weeklyCount}</p>
              <p className={`z-10 pointer-events-none w-12 h-10 flex items-center justify-center ${getPickCountColor(monthlyCount, monthlyLimit)}`}>{monthlyCount}</p>
              <p className={`z-10 pointer-events-none w-12 h-10 flex items-center justify-center ${getPickCountColor(yearlyCount, yearlyLimit)}`}>{yearlyCount}</p>
              <p className={`z-10 pointer-events-none w-12 h-10 flex items-center justify-center ${getPickCountColor(alltimeCount, alltimeLimit)}`}>{alltimeCount}</p>
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