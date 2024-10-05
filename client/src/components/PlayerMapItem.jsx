import { Link } from 'react-router-dom';

export default function PlayerMapItem({mapId, mapName, mapArtist, mapper}) {  
    return (
      <Link to={`/history/${mapId}`} state={{ fromApp: true }} className="w-full">
        <div
          className={`relative flex items-center justify-between h-16 rounded-lg px-6 font-visby font-bold text-2xl text-opacity-80 shadow-lg text-white hover:-translate-y-0.5 hover:shadow-2xl transition-all duration-300 hover:opacity-80 overflow-hidden`}>
            <div
                className="absolute inset-0 bg-cover bg-center transition-transform duration-500 hover:scale-105"
                style={{
                    backgroundImage: `linear-gradient(to right, rgba(0, 0, 0, 0.6) 20%, rgba(0, 0, 0, 0.2) 100%), url(https://assets.ppy.sh/beatmaps/${mapId}/covers/slimcover.jpg)`,
                }}
            />
            <div className="w-6/12 flex flex-col z-10 pointer-events-none">
              <h2 className="truncate w-full text-lg">{mapName}</h2>
              <div className="text-2xs flex items-center w-full">
                <p className="truncate">{mapArtist} •<span className="text-gray-500"> Mapped by {mapper}</span></p>
              </div>
            </div>
        </div>
      </Link>
    )
}