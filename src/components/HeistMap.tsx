import React from "react";

type HexagonProps = {
  size: number;
  x: number;
  y: number;
  color?: string;
};

const Hexagon: React.FC<HexagonProps> = ({
  size,
  x,
  y,
  color = "transparent",
}) => {
  // Calculate the points for a regular hexagon
  const calculateHexPoints = (size: number): string => {
    const points = [];
    for (let i = 0; i < 6; i++) {
      const angle = (Math.PI / 3) * i - Math.PI / 6; // Start from top (rotated)
      const xPoint = size * Math.cos(angle);
      const yPoint = size * Math.sin(angle);
      points.push(`${xPoint},${yPoint}`);
    }
    return points.join(" ");
  };

  return (
    <g transform={`translate(${x}, ${y})`}>
      <polygon
        points={calculateHexPoints(size)}
        fill={color}
        stroke="white"
        strokeWidth="1"
        className="transition-all duration-300 hover:fill-gray-700 cursor-pointer"
      />
    </g>
  );
};

type HeistMapProps = {
  hexSize?: number;
  backgroundColor?: string;
};

const HeistMap: React.FC<HeistMapProps> = ({ hexSize = 50 }) => {
  // Configuration for the number of hexagons in each row
  const rowConfig = [3, 4, 5, 4, 3];

  // Calculate hex dimensions
  const hexWidth = hexSize * Math.sqrt(3);
  const hexHeight = hexSize * 2;

  // Calculate the total width and height needed for the SVG
  const totalWidth = (Math.max(...rowConfig) + 0.5) * hexWidth;
  const totalHeight = (rowConfig.length * 1.5 + 0.5) * hexSize;

  // Function to render hexagons row by row
  const renderHexagons = () => {
    const hexagons: React.JSX.Element[] = [];

    rowConfig.forEach((hexCount, rowIndex) => {
      // Calculate offset for centering each row
      const rowOffset = (totalWidth - hexCount * hexWidth) / 2;

      for (let colIndex = 0; colIndex < hexCount; colIndex++) {
        const xPos = colIndex * hexWidth + rowOffset;
        // For odd rows, shift horizontally to create the honeycomb pattern
        const yPos = rowIndex * hexSize * 1.5;

        hexagons.push(
          <Hexagon
            key={`hex-${rowIndex}-${colIndex}`}
            size={hexSize}
            x={xPos + hexWidth / 2}
            y={yPos + hexSize}
          />
        );
      }
    });

    return hexagons;
  };

  return (
    <div className="flex justify-center items-center w-full">
      <svg
        width={totalWidth}
        height={totalHeight}
        viewBox={`0 0 ${totalWidth} ${totalHeight}`}
      >
        {renderHexagons()}
      </svg>
    </div>
  );
};

export default HeistMap;
