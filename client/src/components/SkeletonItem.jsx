export function SkeletonItem() {
  return (
    <div className="animate-pulse h-20 my-2">
        <div className="h-full w-full rounded-lg bg-osuslate-100 opacity-30 flex items-center justify-between bg-cover bg-center mx-auto max-w-screen-xl text-2xl px-6 border-r-4 border-gray-300">
            <h2 className="w-2/3 h-8 bg-gray-300 rounded-lg"></h2>
            <p className="w-16 h-8 bg-gray-300 rounded-lg"></p>
        </div>
    </div>
  );
}