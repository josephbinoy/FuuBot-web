export default function SkeletonPlayerMapItem({type}) {
    return (
      <div className="animate-pulse h-16 mb-4">
          <div className="h-full w-full rounded-lg bg-osuslate-100 opacity-30 flex items-center justify-between text-xl px-6">
              <div className="w-6/12 flex flex-col gap-1">
                <h2 className="w-full h-5 bg-gray-300 mt-1 rounded-md"></h2>
                <p className="w-2/4 h-3 bg-gray-300 rounded-reg"></p>
              </div>
              <p className="w-2/12 h-5 bg-gray-300 rounded-md"></p>
          </div>
      </div>
    );
  }