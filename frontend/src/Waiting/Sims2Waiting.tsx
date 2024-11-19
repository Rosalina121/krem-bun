import React, { useEffect, useState } from "react";
import { FaBluesky, FaCat, FaGamepad, FaLaptopCode, FaLinux } from "react-icons/fa6";
import { GiFamilyHouse } from "react-icons/gi";
import { PiRainbowBold } from "react-icons/pi";
import { SiGodotengine } from "react-icons/si";

// At the top level, modify how we store icons - store just the component type instead of the rendered component
const iconComponents = [FaGamepad, FaBluesky, SiGodotengine, FaLinux, FaCat, GiFamilyHouse, PiRainbowBold, FaLaptopCode];

type IconMap = Map<string, typeof FaGamepad>; // or create a union type of all possible icons

export default function Sims2Waiting() {

  const [loadingProgress, setLoadingProgress] = useState(0)
  const [clearing, setClearing] = useState(false)

  const [litBoxes, setLitBoxes] = useState(new Map<number, Set<number>>())

  const [iconAssignments, setIconAssignments] = useState<IconMap>(new Map())

  useEffect(() => {
    const newIconAssignments = new Map();

    for (let row = 1; row <= 9; row++) {
      for (let col = 1; col <= 11; col++) {
        const key = `${row}-${col}`;
        const randomIcon = iconComponents[Math.floor(Math.random() * iconComponents.length)];
        newIconAssignments.set(key, randomIcon);
      }
    }

    setIconAssignments(newIconAssignments);
  }, []);

  // Effect to handle progress changes and update lit boxes
  useEffect(() => {
    if (!clearing && loadingProgress > 0) {
      // Only update for the new column
      const newLitBoxes = new Map(litBoxes)
      if (!newLitBoxes.has(loadingProgress)) {
        const numToLight = Math.random() < 0.5 ? 1 : 2
        const availableRows = new Set<number>()

        // Collect available rows for this column (excluding large square area)
        for (let row = 1; row <= 9; row++) {
          if (!(loadingProgress >= 5 && loadingProgress <= 7 &&
            row >= 4 && row <= 6)) {
            availableRows.add(row)
          }
        }

        // Randomly select rows to light
        const selectedRows = new Set<number>()
        for (let i = 0; i < numToLight && availableRows.size > 0; i++) {
          const availableRowsArray = Array.from(availableRows)
          const randomIndex = Math.floor(Math.random() * availableRowsArray.length)
          const selectedRow = availableRowsArray[randomIndex]
          selectedRows.add(selectedRow)
          availableRows.delete(selectedRow)
        }

        newLitBoxes.set(loadingProgress, selectedRows)
        setLitBoxes(newLitBoxes)
      }
    } else if (clearing) {
      // Remove the last column's lit boxes when clearing
      const newLitBoxes = new Map(litBoxes)
      newLitBoxes.delete(loadingProgress + 1)
      console.log("deleting", loadingProgress + 1)
      setLitBoxes(newLitBoxes)
    }
  }, [loadingProgress, clearing])

  const generateGridItems = () => {
    const items = [];
    const largeSquareStart = { col: 5, row: 4 };
    const largeSquareEnd = { col: 7, row: 6 };

    for (let row = 1; row <= 9; row++) {
      for (let col = 1; col <= 11; col++) {
        if (col === largeSquareStart.col && row === largeSquareStart.row) {
          items.push(
            <LargeImageSquare
              key={`large-${row}-${col}`}
            />
          );
        }
        else if (!(col >= largeSquareStart.col && col <= largeSquareEnd.col &&
          row >= largeSquareStart.row && row <= largeSquareEnd.row)) {
          const isLit = litBoxes.get(col)?.has(row) ?? false;
          const key = `${row}-${col}`;
          items.push(
            <ImageSquare
              key={key}
              on={isLit}
              icon={iconAssignments.get(key)}
            />
          );
        }
      }
    }

    return items;
  }

  useEffect(() => {
    let timeout: Timer;

    if (clearing) {
      timeout = setTimeout(() => {
        if (loadingProgress > 0) {
          setLoadingProgress(loadingProgress - 1)
        } else {
          setClearing(false)
          setLoadingProgress(0)
        }
      }, 200)
    } else {
      if (loadingProgress == 11) {
        timeout = setTimeout(() => {
          setClearing(true)
        }, 3000)
      } else {
        timeout = setTimeout(() => {
          setLoadingProgress(loadingProgress + 1)
        }, 3000)
      }
    }

    return (() => {
      clearTimeout(timeout)
    })
  }, [loadingProgress, clearing])

  return (
    <>
      <div
        className="w-screen h-screen flex items-center justify-center relative overflow-hidden"
        style={{
          perspective: "1000px", // Increased perspective for better control
        }}>
        <div
          className="absolute aspect-[4/3] w-full bg-gradient-to-t from-[#13346A] to-[#0D6C8C] "
          style={{
            transformStyle: "preserve-3d",
            transform: `
              rotateX(28deg)
              scale(1)
              translateY(-10%)
            `,
            transformOrigin: "center center",
          }}
        >
          <div className="w-full h-12 grid grid-cols-11 justify-items-center my-4">
            {Array(loadingProgress).fill(null).map((_, i) => (
              <div
                key={i}
                className="w-36 h-12 bg-[#1BE4FA] blur-[2px]"
              />
            ))}
          </div>
          <div className="items-center justify-items-center grid grid-cols-11 grid-rows-8 gap-2">
            {generateGridItems()}
          </div>
        </div>
      </div>
      <div className="absolute bottom-0 flex flex-col w-full items-center gap-6 h-96 justify-center bg-gradient-to-t from-[#0A3F69] to-transparent">
        <div className="text-white text-5xl font-bold font-[Comic]">Loading</div>
        <div className="text-white text-7xl font-bold font-[Comic]">Transmisja Kremówki</div>
      </div>
    </>

  )
}

function ImageSquare({ on = false, icon: Icon }: { on?: boolean, icon?: typeof FaGamepad }) {
  const styleOff = `border-[#3C6D95]`
  const styleOn = `border-[#0A3F69]`
  const styleBgOff = ` bg-[#0A3F69]/70 `
  const styleBgOn = ` bg-[#1296E9]/40 `

  return (
    <div className={`transition-all duration-300 ${on ? styleOn + styleBgOn : styleOff + styleBgOff} w-36 h-36 rounded-2xl border-4  p-1`}>
      <div className={`transition-all duration-300 ${on ? styleOn : styleOff} w-full h-full rounded-xl border-4 flex items-center justify-center`}>
        {Icon && <Icon
          className={`w-20 h-20 transition-all duration-300 ${on ? 'text-[#8ACF33]' : 'text-white/80'}`}
          style={{
            filter: 'drop-shadow(0 0 1px #0A3F69) drop-shadow(0 0 1px #0A3F69)'
          }}
        />}
      </div>
    </div>
  )
}

function LargeImageSquare() {
  return (
    <div
      className="bg-[#1BE4FA] w-full h-full rounded-2xl border-[3px] border-[white] p-4 -z-10"
      style={{
        gridColumn: "5 / span 3", // Start at column 5 and span 3 columns
        gridRow: "4 / span 3",    // Start at row 4 and span 3 rows
        boxShadow: "inset 0 0 12px white, 0 0 500px 300px #15B9DC"
      }}
    >
      <div
        className="w-full h-full rounded-xl border-[3px] border-[white] flex items-center justify-center"
        style={{
          boxShadow: "inset 0 0 12px white"
        }}
      >
        Large icon here
        lololo
      </div>
    </div>
  );
}
