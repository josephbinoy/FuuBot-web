export default function SkeletonPlayerCard({idx}) {
    return (<>
        {idx===0 && <p className="animate-pulse h-5 w-44 bg-osuslate-100 opacity-50 mt-3 mb-5 rounded-md" />}
        <div className="animate-pulse">
            <div className="flex items-center justify-between gap-2 rounded-lg p-2 h-14 bg-osuslate-100 opacity-30 ">
                <div className="flex gap-2 items-center">
                    <div className="h-10 w-10 rounded-md bg-gray-300"/>
                    <p className='rounded-md h-7 w-9 bg-gray-300'></p>
                    <p className='rounded-md h-7 w-32 bg-gray-300'></p>
                </div>
                <p className='rounded-md h-8 w-32 bg-gray-300'></p>
            </div>
    </div>
    </>
    )
}