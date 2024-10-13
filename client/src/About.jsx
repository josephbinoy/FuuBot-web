import CustomNavbar from "./components/CustomNavbar"
import StaminaChart from "./components/StaminaChart";

export default function About() {
  return(
    <div className="bg-osuslate-500 min-h-screen scrollbar scrollbar-thumb-osuslate-200 h-32 overflow-y-auto">
        <CustomNavbar />
        <h1 className="text-5xl text-gray-300 font-black px-10 mx-auto max-w-screen-xl my-8">About FuuBot</h1>
        <div className="flex flex-col mx-auto max-w-screen-xl px-10 text-gray-300" id="stamina">
            <h2 className="text-3xl font-black my-5">Stamina Limit Chart</h2>
            <StaminaChart />
        </div>
        <div className="flex flex-col mx-auto max-w-screen-xl px-10 text-gray-300" id="stamina">
            <h2 className="text-3xl font-black my-5">What is Stamina Limit?</h2>
            <p>Stamina limit is a formula that calculates the maximum amount of stamina a player can have in a game. The formula is as follows:</p>
            <p className="my-3">For 2 minutes and under: </p>
            <Formula />
            <p className="text-gray-300 ">Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.</p>
        </div>
        <div className="flex flex-col mx-auto max-w-screen-xl px-10 text-gray-300" id="why">
            <h2 className="text-3xl font-black mb-5">Why FuuBot?</h2>
            <p className="text-gray-300 ">Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.</p>
        </div>
    </div>
  );
}