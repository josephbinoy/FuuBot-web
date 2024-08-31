import { ButtonGroup, Button } from "@material-tailwind/react";
 
export default function CustomButtonGroup() {
  return (
    <ButtonGroup fullWidth ripple={false} size="lg" color="blue-gray">
      <Button className="text-xl">Weekly</Button>
      <Button className="text-xl">Monthly</Button>
      <Button className="text-xl">Yearly</Button>
      <Button className="text-xl">Alltime</Button>
    </ButtonGroup>
  );
}