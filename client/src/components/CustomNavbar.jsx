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
import { NavLink, Link } from "react-router-dom";
 
function NavList() {
  return (
    <ul className="my-2 flex flex-col gap-2 lg:mb-0 lg:mt-0 lg:flex-row lg:items-center lg:gap-6">
      <NavLink to={"/"} className={({ isActive }) => isActive ? 'text-osuslate-50 scale-105' : ''} >
        <Typography
          as="li"
          variant="h4"
          className="p-1 font-extrabold font-visby"
        >
          Beatmaps
        </Typography>
      </NavLink>
      <Popover placement="bottom" offset={-32} >
      <PopoverHandler>
      <NavLink to={"#"}>
        <Typography
          as="li"
          variant="h4"
          className="p-1 font-extrabold font-visby"
        >
          Players
        </Typography>
      </NavLink>
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
 
export default function CustomNavbar() {
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
          <img src="/logo.png" alt="logo" className="h-8 mx-1 mt-1"></img>
          <Typography
            as={Link}
            to={"/"}
            variant="h2"
            color="blue-gray"
            textGradient={true}
            className="py-1.5 font-visby font-black flex items-center justify-center"
          >
            FuuBot
          </Typography>
        </div>
        <div className="hidden lg:block">
          <NavList />
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
        <NavList />
      </Collapse>
    </Navbar>
  );
}