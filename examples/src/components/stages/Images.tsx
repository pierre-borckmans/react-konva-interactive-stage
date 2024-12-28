import { Circle, Group } from "react-konva";

export const Images = () => {
  return <Group>
    <Circle x={100} y={100} radius={50} fill="green" />
    <Circle x={200} y={100} radius={50} fill="green" />
    <Circle x={300} y={100} radius={50} fill="green" />
  </Group>
};
