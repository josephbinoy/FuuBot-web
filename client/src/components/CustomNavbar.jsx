import { useEffect, useState} from "react";
import {
  Navbar,
  Collapse,
  Typography,
  IconButton,
  Popover,
  PopoverHandler,
  PopoverContent
} from "@material-tailwind/react";
import { Bars3Icon, XMarkIcon } from "@heroicons/react/24/outline";
 
function NavList({tab}) {
  return (
    <ul className="my-2 flex flex-col gap-2 lg:mb-0 lg:mt-0 lg:flex-row lg:items-center lg:gap-6">
      <Typography
        as="li"
        variant="h4"
        className="p-1 font-extrabold"
      >
        <a href="#" className={`flex items-center hover:text-osuslate-50 hover:-translate-y-px hover:scale-105 ${tab === 'beatmaps' && 'text-osuslate-50 -translate-y-px scale-105'}`}>
          Beatmaps
        </a>
      </Typography>
      <Popover placement="bottom" offset={-32} >
      <PopoverHandler>
      <Typography
        as="li"
        variant="h4"
        className="p-1 font-extrabold"
      >
        <a href="#" className={`flex items-center hover:text-osuslate-50 hover:-translate-y-px hover:scale-105 ${tab === 'artists' && 'text-osuslate-50 -translate-y-px scale-105'}`}>
          Artists
        </a>
      </Typography>
      </PopoverHandler>
      <PopoverContent className="z-[999] overflow-hidden p-0"> 
          <div className="h-28 w-28">
            <img
              src="https://media1.tenor.com/m/lYbTKdA7da4AAAAC/40hara-kinako.gif"
            />
          </div>
        </PopoverContent>
      </Popover>
      <Popover placement="bottom" offset={-32} >
      <PopoverHandler>
      <Typography
        as="li"
        variant="h4"
        className="p-1 font-extrabold"
      >
        <a href="#" className={`flex items-center hover:text-osuslate-50 hover:-translate-y-px hover:scale-105 ${tab === 'mappers' && 'text-osuslate-50 -translate-y-px scale-105'}`}>
          Mappers
        </a>
      </Typography>
      </PopoverHandler>
      <PopoverContent className="z-[999] overflow-hidden p-0"> 
          <div className="h-28 w-28">
            <img
              src="https://media1.tenor.com/m/lYbTKdA7da4AAAAC/40hara-kinako.gif"
            />
          </div>
        </PopoverContent>
      </Popover>
    </ul>
  );
}
 
export default function CustomNavbar({ tab }) {
  const [openNav, setOpenNav] = useState(false);
 
  const handleWindowResize = () =>
    window.innerWidth >= 960 && setOpenNav(false);
 
  useEffect(() => {
    window.addEventListener("resize", handleWindowResize);
 
    return () => {
      window.removeEventListener("resize", handleWindowResize);
    };
  }, []);
 
  return (
    <Navbar className="mx-auto max-w-screen-xl px-6 py-3 h-22" color="blue-gray" >
      <div className="flex items-center justify-between">
        <div className="flex justify-evenly items-center hover:opacity-70 opacity-60">
          <img src="/logo.png" className="h-8 mx-1 mt-1"></img>
          <Typography
            as="a"
            href="#"
            variant="h2"
            color="blue-gray"
            textGradient={true}
            className="py-1.5 font-visby font-black flex items-center justify-center"
          >
            FuuBot
          </Typography>
        </div>
        <div className="hidden lg:block">
          <NavList tab={tab}/>
        </div>
        <IconButton
          variant="text"
          className="ml-auto h-6 w-6 text-inherit hover:bg-transparent focus:bg-transparent active:bg-transparent lg:hidden"
          ripple={false}
          onClick={() => setOpenNav(!openNav)}
        >
          {openNav ? (
            <XMarkIcon className="h-6 w-6" strokeWidth={2} />
          ) : (
            <Bars3Icon className="h-6 w-6" strokeWidth={2} />
          )}
        </IconButton>
      </div>
      <Collapse open={openNav}>
        <NavList tab={tab}/>
      </Collapse>
    </Navbar>
  );
}