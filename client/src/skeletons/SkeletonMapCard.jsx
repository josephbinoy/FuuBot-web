export default function SkeletonMapCard() {
    return(
    <div className="mx-auto max-w-screen-xl w-11/12 mb-8 mt-4 h-56 flex rounded-lg relative p-5 overflow-hidden animate-pulse bg-osuslate-100 opacity-30">
    <div className="absolute top-3 right-3 h-8 w-8 rounded-lg bg-gray-300"/>
    <div className="absolute bottom-3 right-3 h-8 w-8 rounded-lg bg-gray-300" />
    <div className="w-6/12 flex flex-col items-start justify-between">
        <div className="w-full text-gray-300 flex flex-col gap-2">
            <h1 className="h-10 rounded-lg bg-gray-300"></h1>
            <div className="h-5 w-6/12 rounded-reg bg-gray-300" />
            <div className="h-5 w-28 rounded-reg bg-gray-300" />
        </div>
        <div className="flex gap-2">
            <div className="w-12 h-12 rounded-lg bg-gray-300" />
            <div className="flex flex-col justify-center gap-2">                
                <h3 className="h-4 w-32 bg-gray-300 rounded-reg"></h3>
                <p className="h-3 w-32 bg-gray-300 rounded-reg"></p>
            </div>
        </div>
    </div>
  </div>
    )
}