import { useState, useEffect } from 'react';
import axios from 'axios';
import ReactCountryFlag from 'react-country-flag';
import { convertSecondsToDaysHours } from '../utils/time';
import { HeartIcon, ArrowTopRightOnSquareIcon } from '@heroicons/react/24/solid';

export default function ProfileCard({ id }) {
    const [playerData, setPlayerData] = useState({});
    const [pickCounts, setPickCounts] = useState({
        alltimeCount: 0,
        weeklyCount: 0
    });
    useEffect(() => {
        const fetchData = async () => {
            try {
                if (!id) return;
                const response = await axios.get(`${import.meta.env.VITE_API_URL}/profile/${id}`);
                setPlayerData(response.data.player);
                setPickCounts({
                    alltimeCount: response.data.alltimeCount,
                    weeklyCount: response.data.weeklyCount || 0
                });
            } catch (error) {
                console.log('Error fetching data:', error);
                if(!error.response){
                    setalertMsg("Server under maintenance. Please try again later")
                    return;
                }
                if(error.response.data.error === "Invalid parameters") {         
                    setalertMsg("Player not found");
                }
                else{
                    setalertMsg("Error fetching data");
                }
            }
        };
        fetchData();
    }, []);
    return (
        <div className='w-10/12 flex flex-col items-center justify-center rounded-lg relative overflow-hidden bg-osuslate-300 shadow-lg'>
        <a href={`https://osu.ppy.sh/users/${id}`}><ArrowTopRightOnSquareIcon height={25} width={25} className="absolute top-3 right-3 text-gray-300 z-30 opacity-70" /></a>
            <div className="absolute inset-0 h-24 2xl:h-32 w-full">
                <div
                    className="absolute inset-0 bg-cover bg-center"
                    style={{
                        backgroundImage: `url(${playerData.cv})`,
                    }}
                />
                <div className="absolute inset-0 bg-black opacity-40" />
            </div>
            <div className='z-10 flex items-center mt-18 2xl:mt-24 w-full px-5 justify-center'>
                <img src={`https://a.ppy.sh/${id}`} className='h-20 w-20 2xl:h-24 2xl:w-24 rounded-xl shadow-lg'></img>
                <div className='flex flex-col items-center justify-center self-end w-fit pl-5'>
                    <div className='flex items-center justify-center gap-2 pt-4'>
                        <p className='text-2xl text-gray-300 font-bold truncate'>{playerData.n}</p>
                        {playerData.sp === "true" && <div className='flex h-6 w-6 items-center justify-center bg-[#ff66ab] rounded-full'>
                            <HeartIcon className='h-4 w-4 text-white' />
                        </div>}
                    </div>
                    <div className='flex items-center justify-center gap-2'>
                        <ReactCountryFlag
                            countryCode={playerData.con_c}
                            svg
                            className='rounded-md text-xl'
                        />
                        <p className='text-base text-gray-300 opacity-70'>{playerData.con_n}</p>
                    </div>
                </div>
            </div>
            <div className='flex h-20 items-start justify-center w-full mt-4 2xl:mt-8'>
                <div className='w-6/12 border-r border-gray-500 border-opacity-40 flex items-center justify-center flex-col'>
                    <p className='text-gray-300 opacity-70 text-base'>weekly picks</p>
                    <p className='text-3xl text-gray-300'>{pickCounts.weeklyCount}</p>
                </div>
                <div className='w-6/12 flex items-center justify-center flex-col'>
                    <p className='text-gray-300 opacity-70 text-base'>alltime picks</p>
                    <p className='text-3xl text-gray-300'>{pickCounts.alltimeCount}</p>
                </div>
            </div>
            <div className='w-full px-5 pb-5 flex flex-col items-start justify-evenly text-gray-300 text-base 2xl:gap-2 -mt-2 2xl:mt-2'>
                <div className='flex items-center justify-between w-full'><p className='opacity-70'>Global Rank: </p><p>#{Number(playerData.gr).toLocaleString()}</p></div>
                <div className='flex items-center justify-between w-full'><p className='opacity-70'>pp: </p><p>{Number(Number(playerData.pp).toFixed(0)).toLocaleString()}</p></div>
                <div className='flex items-center justify-between w-full'><p className='opacity-70'>Accuracy: </p><p>{Number(playerData.acc).toFixed(2)}%</p></div>
                <div className='flex items-center justify-between w-full'><p className='opacity-70'>Play Time: </p><p>{convertSecondsToDaysHours(playerData.pt)}</p></div>
                <div className='flex items-center justify-between w-full'><p className='opacity-70'>Play Count: </p><p>{Number(playerData.pc).toLocaleString()}</p></div>
            </div>
        </div>
    )
}