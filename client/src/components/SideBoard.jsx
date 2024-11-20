import {  Card, Typography, CardBody } from "@material-tailwind/react";
import { useState, useEffect } from "react";
import { useAlert } from "../context/AlertProvider";
import SkeletonSideboardRow from "../skeletons/SkeletonSideboardRow";
import ReactCountryFlag from "react-country-flag";
import axios from "axios";
import { Link } from "react-router-dom";
import PulsingPfp from "./PulsingPfp";
  
export default function LeaderBoard({type}) {
  const [rows, setRows] = useState([null, null, null, null, null, null, null, null, null, null]);
  const { setalertMsg } = useAlert();
  useEffect(() => {
    const fetchData = async () => {
        try {
            const response = await axios.get(`${import.meta.env.VITE_API_URL}/sideboard/${type}`);
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

  return (
    <Card className="w-full mx-5 overflow-hidden bg-osuslate-200/50">
      <CardBody className="p-0">
        <table className="w-full min-w-max table-auto text-center">
         <thead className="bg-osuslate-200 z-20">
            <tr className="h-16 border-b border-osuslate-500 bg-osuslate-200">
            <th className="w-[130px] py-4"
                >
                  <Typography
                    color="blue-gray"
                  >
                    Rank
                  </Typography>
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
                <th className="p-4 w-[160px]"
                >
                  <Typography
                    color="blue-gray"
                    className='flex items-center justify-center gap-1 opacity-70'

                  >
                    Pick Count
                  </Typography>
                </th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, index) => row ? <tr key={index} className={`${index==rows.length-1?'':'border-black/10 border-b'} h-20`}>
                  <td className='p-4'>
                      <Typography 
                        color="blue-gray"
                      >
                        {index+1}
                      </Typography>
                    </td>
                    <td className='p-4'>
                      <Link className="flex gap-3 items-center justify-start" to={`/profile/${row.id}`} state={{ fromApp: true }}>
                        <PulsingPfp imageUrl={`https://a.ppy.sh/${row.id}`} />
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
                      {index===0 && <img src={type==="unique" ? "crown_gold.png":"poo_gold_smoothed.png"} className="h-10 text-[#FFD700]" />}
                      </Link>
                    </td>
                    <td className='p-4'>
                      <Typography color="blue-gray">
                        {row.pickCount}
                      </Typography>
                    </td>
                  </tr> : <SkeletonSideboardRow key={index}/>
            )}
          </tbody>
        </table>
      </CardBody>
    </Card>
  );
}