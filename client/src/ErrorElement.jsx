import { useRouteError } from "react-router-dom";
import CustomNavbar from "./components/CustomNavbar";

export default function ErrorElement() {
  const error = useRouteError();
  console.error(error);

  return (
    <div className="bg-osuslate-500 min-h-screen scrollbar scrollbar-thumb-osuslate-200 h-32 overflow-y-auto">
        <CustomNavbar />
        <h1 className="mx-auto max-w-screen-xl text-5xl text-gray-300 font-black px-10 my-8">404 Page Not Found</h1>
        <img src="https://media1.tenor.com/m/nweis3gUlZgAAAAC/osu-chinese-weaboo.gif" alt="404" className="mx-auto max-w-screen-xl w-4/12 mt-16" />
        <p className="mx-auto max-w-screen-xl text-center text-2xl text-gray-300 font-bold mt-4">The page you are looking for does not exist :/</p>
    </div>
  );
}