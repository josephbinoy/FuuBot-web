import { useState, useEffect} from "react";
import {
  Navbar,
  Collapse,
  Typography,
  IconButton,
} from "@material-tailwind/react";
import { Bars3Icon, XMarkIcon } from "@heroicons/react/24/outline";
import { NavLink, Link } from "react-router-dom";
 
function NavList() {
  return (
    <ul className="my-2 flex flex-col gap-2 lg:mb-0 lg:mt-0 lg:flex-row lg:items-center lg:gap-6">
      <NavLink to={"/"} className={({ isActive }) => isActive ? 'text-osuslate-50 lg:scale-105 p-1 font-extrabold font-visby text-2xl' : 'p-1 font-extrabold font-visby text-2xl'} >
          Beatmaps
      </NavLink>
      <NavLink to={"/players"} className={({ isActive }) => isActive ? 'text-osuslate-50 lg:scale-105 p-1 font-extrabold font-visby text-2xl' : 'p-1 font-extrabold font-visby text-2xl'} >
          Players
      </NavLink>
    </ul>
  );
}
 
export default function CustomNavbar({classes}) {
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
    <Navbar className={`mx-auto max-w-screen-xl px-6 py-3 min-h-22 ${classes ? classes : ''}`} color="blue-gray">
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