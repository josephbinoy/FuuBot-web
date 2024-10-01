export default function SkeletonRow() {
    return (
        <tr className= "animate-pulse h-20 opacity-30 border-b border-gray-700/10">
            <td className='pl-10'>
                <div className="w-8 h-8 bg-gray-300 rounded-md"/>
            </td>
            <td className='p-4'>
                <div className="flex gap-3 items-center justify-start">
                    <div className="h-10 w-10 rounded-md bg-gray-300"/>
                    <p className='rounded-md h-7 w-9 bg-gray-300'></p>
                    <p className='rounded-md h-8 w-40 bg-gray-300'></p>
                </div>
            </td>
            <td className='p-4 pl-12'>
                <div className="w-8 h-8 bg-gray-300 rounded-md"/>
            </td>
            <td className='p-4 pl-12'>
                <div className="w-8 h-8 bg-gray-300 rounded-md"/>
            </td>
        </tr>
    )
}