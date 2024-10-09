export default function BlackItem({mapId, mapName, mapArtist, mapper, weeklyCount=0, monthlyCount=0, yearlyCount=0, alltimeCount=0}) {    
    return (
      <a href={`https://osu.ppy.sh/beatmapsets/${mapId}`} className="w-full">
        <div className={`relative flex items-center justify-between h-20 rounded-lg px-6 pr-3 font-visby font-bold text-2xl text-opacity-80 shadow-osuslate-200/20 shadow-lg text-gray-500 border-r-4 border-black hover:-translate-y-0.5 hover:shadow-lg transition-all duration-300 hover:opacity-80 overflow-hidden grayscale`}>
          <div
            className="absolute inset-0 bg-cover bg-center transition-transform duration-500 hover:scale-105"
            style={{
                backgroundImage: `linear-gradient(to right, rgba(0, 0, 0, 0.7) 20%, rgba(0, 0, 0, 0.4) 80%, rgba(0, 0, 0, 0.7) 100%), url(https://assets.ppy.sh/beatmaps/${mapId}/covers/slimcover.jpg)`,
            }}
          />
          <div className="w-6/12 flex flex-col gap-1 z-10 pointer-events-none">
            <h2 className="truncate w-full">{mapName}</h2>
            <div className="text-xs flex items-center w-full">
              <p className="truncate">{mapArtist} •<span className="text-gray-600"> Mapped by {mapper}</span></p>
            </div>
          </div>
          {alltimeCount !== 0 && <div className='flex items-center justify-center divide-x-1 divide-gray-300 divide-opacity-30'>
            <p className={'relative z-10 pointer-events-none w-12 h-10 flex items-end justify-center'}><span className='text-2xs absolute -top-1 text-gray-300 opacity-70'>W</span>{weeklyCount}</p>
            <p className={'relative z-10 pointer-events-none w-12 h-10 flex items-end justify-center'}><span className='text-2xs absolute -top-1 text-gray-300 opacity-70'>M</span>{monthlyCount}</p>
            <p className={'relative z-10 pointer-events-none w-12 h-10 flex items-end justify-center'}><span className='text-2xs absolute -top-1 text-gray-300 opacity-70'>Y</span>{yearlyCount}</p>
            <p className={'relative z-10 pointer-events-none w-12 h-10 flex items-end justify-center'}><span className='text-2xs absolute -top-1 text-gray-300 opacity-70'>A</span>{alltimeCount}</p>
          </div>}
        </div>
      </a>
    )
  }