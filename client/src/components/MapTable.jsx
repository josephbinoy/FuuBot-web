import MapItem from "./MapItem"
import { SkeletonItem } from "./SkeletonItem"

const maps = [
    {
        mapName: "Heart of Android : Even If It's Only By Mechanism",
        mapArtist: "Camellia",
        imageUrl: "https://assets.ppy.sh/beatmaps/1072415/covers/cover.jpg?1724401260",
        mapCount: 424,
        status: "red"
    },
    {
        mapName: "Heart of Android : Even If It's Only By Mechanism",
        mapArtist: "Camellia",
        imageUrl: "https://assets.ppy.sh/beatmaps/1072415/covers/cover.jpg?1724401260",
        mapCount: 400,
        status: "red"
    },
    {
        mapName: "Heart of Android : Even If It's Only By Mechanism",
        mapArtist: "Camellia",
        imageUrl: "https://assets.ppy.sh/beatmaps/1072415/covers/cover.jpg?1724401260",
        mapCount: 390,
        status: "orange"
    },
    {
        mapName: "Heart of Android : Even If It's Only By Mechanism",
        mapArtist: "Camellia",
        imageUrl: "https://assets.ppy.sh/beatmaps/1072415/covers/cover.jpg?1724401260",
        mapCount: 230,
        status: "orange"
    },
    {
        mapName: "Heart of Android : Even If It's Only By Mechanism",
        mapArtist: "Camellia",
        imageUrl: "https://assets.ppy.sh/beatmaps/1072415/covers/cover.jpg?1724401260",
        mapCount: 100,
        status: "orange"
    },
    {
        mapName: "Heart of Android : Even If It's Only By Mechanism",
        mapArtist: "Camellia",
        imageUrl: "https://assets.ppy.sh/beatmaps/1072415/covers/cover.jpg?1724401260",
        mapCount: 100,
        status: "green"
    },
    {
        mapName: "Heart of Android : Even If It's Only By Mechanism",
        mapArtist: "Camellia",
        imageUrl: "https://assets.ppy.sh/beatmaps/1072415/covers/cover.jpg?1724401260",
        mapCount: 100,
        status: "skeleton"
    },
    {
        mapName: "Heart of Android : Even If It's Only By Mechanism",
        mapArtist: "Camellia",
        imageUrl: "https://assets.ppy.sh/beatmaps/1072415/covers/cover.jpg?1724401260",
        mapCount: 100,
        status: "skeleton"
    },
]


export default function MapTable(){
    return (
        <div className="flex flex-col">
            {maps.map((map, index) => (
                <>
                    {map.status!='skeleton'?
                    <MapItem key={index} {...map} />:
                    <SkeletonItem key={index} />
                    }
                </>
            ))}
        </div>
    )
}