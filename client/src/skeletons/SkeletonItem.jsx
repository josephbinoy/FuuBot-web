export default function SkeletonItem({type}) {
  return (
    <div className="animate-pulse h-20 w-full">
        <div className="h-full rounded-lg bg-osuslate-100 opacity-30 flex items-center justify-between mx-auto max-w-screen-xl text-2xl px-6 pr-4 border-r-4 border-gray-300">
            <div className="w-6/12 flex flex-col gap-2">
              <h2 className="w-full h-6 bg-gray-300 mt-2 rounded-md"></h2>
              <p className="w-2/4 h-4 bg-gray-300 rounded-md"></p>
            </div>
            {type=='popular' && 
            <div className='flex items-center justify-center gap-2'>
              <p className="w-10 h-10 bg-gray-300 rounded-lg" />
              <p className="w-10 h-10 bg-gray-300 rounded-lg" />
              <p className="w-10 h-10 bg-gray-300 rounded-lg" />
              <p className="w-10 h-10 bg-gray-300 rounded-lg" />
            </div>}
        </div>
    </div>
  );
}