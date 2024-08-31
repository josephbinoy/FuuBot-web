export default function MapItem({mapName, imageUrl, mapCount, status}){
    const borderColorClass = status === 'red' ? 'border-red-500' : status === 'orange' ? 'border-orange-500' : 'border-green-500';
    return (
<div
  className={`flex items-center justify-between bg-cover bg-center mx-auto max-w-screen-xl w-full h-20 rounded-lg my-2 px-6 font-visby font-bold text-2xl text-opacity-80 text-white border-r-4 ${borderColorClass}`}
  style={{
        backgroundImage: `linear-gradient(to right, rgba(0, 0, 0, 0.7) 20%, rgba(0, 0, 0, 0.4) 80%, rgba(0, 0, 0, 0.7) 100%), url(${imageUrl})`
      }}
    >
      <h2>{mapName.length>40?mapName.substring(0,40)+"...":mapName}</h2>
      <p>{mapCount}</p>
</div>
    )
}