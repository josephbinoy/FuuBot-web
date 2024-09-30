import {  ChevronDownIcon } from "@heroicons/react/24/outline";
import {  Card, Typography, CardBody, Tooltip } from "@material-tailwind/react";
import { useState, useEffect } from "react";
import { useAlert } from "../context/AlertProvider";
import SkeletonRow from "../skeletons/SkeletonRow";
import ReactCountryFlag from "react-country-flag";
import CaretDownIcon from "./CaretDownIcon";
import CaretUpIcon from "./CaretUpIcon";
import { getYesterdayDate } from "../utils/time";
import axios from "axios";
  
export default function LeaderBoard({period, currentLeaderboard, setcurrentLeaderboard}) {
  const [rows, setRows] = useState([null, null, null, null, null, null, null, null, null, null]);
  const { setalertMsg } = useAlert();
  const rankFrameDate = getYesterdayDate();
  useEffect(() => {
    const fetchData = async () => {
        try {
            const response = await axios.get(`${import.meta.env.VITE_API_URL}/leaderboard/${period}`);
            const newRows = response.data;
            setRows(prevRows => {
                const filteredRows = prevRows.filter(row => row !== null);
                return [...filteredRows, ...newRows];
            });
        } catch (error) {
            console.log('Error fetching data:', error);
            if(!error.response){
                setalertMsg("Server under maintenance. Please try again later")
            }
            else{
                setalertMsg("Error fetching data")
            }
        }
    };

    fetchData();
}, []);

  return (<>
    <h1 className="text-4xl text-gray-300 font-black px-10">Top 50 Most Picks</h1>
    <Card className="mx-10 my-7 overflow-hidden bg-osuslate-200/50">
      <CardBody className="p-0">
        <table className="w-full min-w-max table-auto text-center">
         <thead className="bg-osuslate-200 z-20">
            <tr className="h-16 border-b border-osuslate-500 bg-osuslate-200">
            <th className="w-4 p-4 pr-8"
                >
                  <Tooltip
                    content={
                      <p>Rank changes are relative to {rankFrameDate}, 00:00 UTC</p>                   
                    }
                  >
                  <Typography
                    color="blue-gray"
                  >
                    Rank
                  </Typography>
                  </Tooltip>
                </th>
            <th className="flex-grow p-4"
                >
                  <Typography
                    color="blue-gray"
                    className="flex"
                  >
                    Player
                  </Typography>
                </th>
                <th onClick={() => setcurrentLeaderboard('weekly')}
                  className="w-32 cursor-pointer p-4"
                >
                  <Typography
                    color="blue-gray"
                    className={`flex items-center justify-center gap-1 opacity-70 ${currentLeaderboard === 'weekly' && '-translate-y-px opacity-100 text-white'}`}
                  >
                    weekly
                      <ChevronDownIcon strokeWidth={2} className="h-4 w-4" />
                  </Typography>
                </th>
                <th onClick={() => setcurrentLeaderboard('alltime')}
                  className="w-32 cursor-pointer p-4"
                >
                  <Typography
                    color="blue-gray"
                    className={`flex items-center justify-center gap-1 opacity-70 ${currentLeaderboard === 'alltime' && '-translate-y-px opacity-100 text-white'}`}
                  >
                    alltime
                      <ChevronDownIcon strokeWidth={2} className="h-4 w-4" />
                  </Typography>
                </th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, index) => row ? <tr key={index} className={`${index==rows.length-1?'':'border-black/10 border-b'} h-20`}>
                  <td className='p-4'>
                    <div className="flex items-center justify-end gap-2">
                      <Typography 
                        color="blue-gray"
                        className="pl-2 mr-4"
                      >
                        {index+1}
                      </Typography>
                      {row.delta && row.delta > 0 ?
                        <div className="flex items-center justify-center gap-1 w-7">
                          <CaretUpIcon classes="min-w-4 min-h-4 stroke-red-500"/>
                          <p className="text-green-500">{row.delta}</p>
                        </div> : row.delta < 0 ?
                        <div className="flex items-center justify-center gap-1 w-7">
                          <CaretDownIcon classes="min-w-4 min-h-4" />
                          <p className="text-red-500">{Math.abs(row.delta)}</p>
                        </div>:
                        <div className="w-7">
                        </div>}
                      </div>
                    </td>
                    <td className='p-4'>
                      <a className="flex gap-3 items-center justify-start" href={`https://osu.ppy.sh/users/${row.id}`}>
                        <img src={`https://a.ppy.sh/${row.id}`} alt="pfp" className="w-10 h-10 rounded-reg" />
                        <ReactCountryFlag
                            countryCode={row.country}
                            svg
                            className='rounded-md text-3xl'
                        />
                      <Typography 
                        color="blue-gray"
                        className="text-left"
                      >
                        {row.name}
                      </Typography>
                      </a>
                    </td>
                    <td className='p-4'>
                      <Typography
                        color="blue-gray"
                        className={`${currentLeaderboard === 'alltime' && 'opacity-70'}`}
                      >
                        {row.weeklyCount}
                      </Typography>
                    </td>
                    <td className='p-4'>
                      <Typography
                        color="blue-gray"
                        className={`${currentLeaderboard === 'weekly' && 'opacity-70'}`}
                      >
                        {row.alltimeCount}
                      </Typography>
                    </td>
                  </tr> : <SkeletonRow key={index}/>
            )}
          </tbody>
        </table>
      </CardBody>
    </Card>
    </>
  );
}