import CustomButtonGroup from "./CustomButtonGroup"

export default function Jumbo({tab}){
    return (
        <div className="mx-auto max-w-screen-xl flex items-center justify-between h-40">
            <h1 className="text-4xl text-osuslate-50 font-black px-10">Popular {tab}</h1>
            <CustomButtonGroup />
        </div>
    )
}