import React, { useEffect, useState } from "react";

export default function Sims2Waiting() {
  const [loadingProgress, setLoadingProgress] = useState(1)
  const [clearing, setClearing] = useState(false)
  
  useEffect(() => {
    let timeout: Timer;
    
    if (clearing) {
      timeout = setTimeout(() => {
        if (loadingProgress - 1 > 0) {
          setLoadingProgress(loadingProgress - 1)
        } else {
          setClearing(false)
          setLoadingProgress(1)
        }
      }, 200)
    } else {
      if (loadingProgress == 11) {
        setClearing(true)
      } else {
          timeout = setTimeout(() => {
            setLoadingProgress(loadingProgress + 1)
          }, 3000)  
      }
    }
  
    return(() => {
      clearTimeout(timeout)
    })
  },[loadingProgress, clearing])
  
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
          <div className="w-full grid grid-cols-11 justify-items-center my-4">
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

function generateGridItems() {
  const items = [];

  // Define the area that will be occupied by the large square
  const largeSquareStart = { col: 5, row: 4 };
  const largeSquareEnd = { col: 7, row: 6 };

  for (let row = 1; row <= 9; row++) {
    for (let col = 1; col <= 11; col++) {
      // Check if current position is where the large square should be
      if (col === largeSquareStart.col && row === largeSquareStart.row) {
        items.push(
          <LargeImageSquare
            key={`large-${row}-${col}`}
          />
        );
      }
      // Skip cells that would be covered by the large square
      else if (!(col >= largeSquareStart.col && col <= largeSquareEnd.col &&
        row >= largeSquareStart.row && row <= largeSquareEnd.row)) {
        items.push(
          <ImageSquare
            key={`${row}-${col}`}
          />
        );
      }
    }
  }

  return items;
}

function ImageSquare({ on = false }: { on?: boolean }) {
  return (
    <div className="w-36 h-36 bg-[#0A3F69] rounded-2xl border-2 border-[#3C6D95] p-1 opacity-80">
      <div className="w-full h-full rounded-xl border-2 border-[#3C6D95] flex items-center justify-center">
        icon here
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
