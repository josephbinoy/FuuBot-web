import { useEffect, useState} from "react";
import {
  Navbar,
  Collapse,
  Typography,
  IconButton,
} from "@material-tailwind/react";
import { Bars3Icon, XMarkIcon } from "@heroicons/react/24/outline";
 
function NavList() {
  return (
    <ul className="my-2 flex flex-col gap-2 lg:mb-0 lg:mt-0 lg:flex-row lg:items-center lg:gap-6">
      <Typography
        as="li"
        variant="h4"
        className="p-1 font-extrabold"
      >
        <a href="#" className="flex items-center hover:text-osuslate-50 hover:-translate-y-px hover:scale-105">
          Beatmaps
        </a>
      </Typography>
      <Typography
        as="li"
        variant="h4"
        className="p-1 font-extrabold"
      >
        <a href="#" className="flex items-center hover:text-osuslate-50 hover:-translate-y-px hover:scale-105">
          Artists
        </a>
      </Typography>
      <Typography
        as="li"
        variant="h4"
        className="p-1 font-extrabold"
      >
        <a href="#" className="flex items-center hover:text-osuslate-50 hover:-translate-y-px hover:scale-105">
          Mappers
        </a>
      </Typography>
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
        <Typography
          as="a"
          href="#"
          variant="h2"
          color="blue-gray"
          textGradient={true}
          className="mr-4 cursor-pointer py-1.5 font-visby font-black"
        >
          FuuBot
        </Typography>
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