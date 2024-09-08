export default function BlackItem({mapId, mapName, mapArtist, mapper, imageUrl}) {    
    return (
      <a href={`https://osu.ppy.sh/beatmapsets/${mapId}`} className="mx-auto max-w-screen-xl w-11/12 my-2">
        <div
          className={`flex items-center justify-between bg-cover bg-center h-20 rounded-lg px-6 font-visby font-bold text-2xl text-opacity-80 shadow-osuslate-200/20 shadow-lg text-white border-r-4 border-black hover:-translate-y-0.5 hover:shadow-lg transition-all duration-200 hover:opacity-85 grayscale`}
          style={{
                backgroundImage: `linear-gradient(to right, rgba(0, 0, 0, 0.7) 20%, rgba(0, 0, 0, 0.4) 80%, rgba(0, 0, 0, 0.7) 100%), 
                url(${imageUrl})`
              }}
            >
            <div className="w-6/12 flex flex-col gap-1">
              <h2 className="truncate w-full">{mapName}</h2>
              <div className="text-xs flex items-center w-full">
                <p className="truncate">{mapArtist} •<span className="text-gray-500"> Mapped by {mapper}</span></p>
              </div>
            </div>
        </div>
      </a>
    )
}