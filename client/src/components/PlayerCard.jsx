import { convertSecondsToDaysHours } from '../utils/time';
import ReactCountryFlag from "react-country-flag"
import { Link } from 'react-router-dom';
import { Tooltip } from '@material-tailwind/react';
import { useEffect, useState } from 'react';

export default function PlayerCard({name, id, country, coverUrl, rank, playTime, pickCount, pickDate}) { 
    const [backgroundLoaded, setBackgroundLoaded] = useState(false);

    useEffect(() => {
      const img = new Image();
      img.src = coverUrl;
      img.onload = () => setBackgroundLoaded(true);
    }, []);

    return (
        <Tooltip
        className="bg-black bg-opacity-80 p-2 px-3 backdrop-blur-sm"
        placement="top-start"
        content={
            <>
                <p>{`Rank: #${Number(rank).toLocaleString()}`}</p>
                <p>{`Playtime: ${convertSecondsToDaysHours(playTime)}`}</p>
            </>
        }
      >
        <Link to={`/profile/${id}`} state={{ fromApp: true }}>
        <div className={`flex items-center justify-between rounded-lg relative p-2 px-3 ${backgroundLoaded ? 'bg-cover bg-center' : 'animate-pulse-fast bg-osuslate-100'} overflow-hidden h-14 text-white shadow-sm hover:opacity-80 transition-all transform duration-300 hover:-translate-y-px hover:shadow-lg`}
            style={{
                backgroundImage: `${backgroundLoaded ? `url(${coverUrl}`:''}`,
            }}>
            <div className="absolute inset-0 bg-black opacity-50" />
            <div className="z-10 flex gap-3 items-center">
                <img src={`https://a.ppy.sh/${id}`} className="h-10 w-10 rounded-md" />
                <ReactCountryFlag
                    countryCode={country}
                    svg
                    className='rounded-md text-3xl'
                />
                <p className='text-xl'>{id==0 ? 'Unknown User' : name}</p><i className='text-base text-gray-400 -ml-2'>{` (${Number(pickCount).toLocaleString()} pick${pickCount == 1 ? '' : 's'})`}</i>
            </div>
                <p className='text-sm opacity-80 px-2'>{pickDate}</p>
            </div>
            </Link>
        </Tooltip>
    )
}