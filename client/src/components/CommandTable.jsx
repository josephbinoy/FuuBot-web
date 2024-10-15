import { Card, Typography } from "@material-tailwind/react";

export default function CommandTable ( { TABLE_ROWS }) {
    return <Card className="w-full mx-auto overflow-hidden bg-osuslate-200/50">
    <table className="w-full table-auto text-left">
        <thead>
        <tr>
            <th className="w-4/12 p-5 px-8">
                <Typography
                color="blue-gray"
                >
                Command               
                </Typography>
            </th>
            <th className="p-4">
                <Typography
                color="blue-gray"
                >
                    Description
                </Typography>
            </th>
        </tr>
        </thead>
        <tbody>
        {TABLE_ROWS.map(({ command, description }, index) => {
            return (
            <tr key={index} className="border-black/10 border-b h-18">
                <td className="p-4 px-8">
                <Typography
                    color="blue-gray"
                    className="font-mono font-bold"
                >
                    {command}
                </Typography>
                </td>
                <td className="p-4">
                <Typography
                    color="blue-gray"
                    className="font-normal"
                >
                    {description}
                </Typography>
                </td>
            </tr>
            );
        })}
        </tbody>
    </table>
    </Card>
}