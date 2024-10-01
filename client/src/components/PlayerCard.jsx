import { timeAgo } from '../utils/time';
import ReactCountryFlag from "react-country-flag"

export default function PlayerCard({name, id, country, coverUrl, rank, pickDate}) {   
    return (
      <a href={`https://osu.ppy.sh/users/${id}`}>
      <div className="flex items-center justify-between rounded-lg relative p-2 px-3 bg-cover bg-center overflow-hidden h-14 text-white shadow-sm hover:opacity-80 transition-all transform duration-300 hover:-translate-y-px hover:shadow-lg"
        style={{
            backgroundImage: `url(${coverUrl}`,
        }}>
        <div className="absolute inset-0 bg-black opacity-50" />
        <div className="z-10 flex gap-3 items-center">
            <img src={`https://a.ppy.sh/${id}`} className="h-10 w-10 rounded-md" />
            <ReactCountryFlag
                countryCode={country}
                svg
                className='rounded-md text-3xl'
            />
            <p className='text-xl'>{id==0 ? 'Unknown User' : name} <i> (#{rank})</i></p>
        </div>
            <p className='text-sm opacity-80 px-2'>{pickDate && `Picked ${timeAgo(pickDate)}`}</p>
        </div>
      </a>
    )
}