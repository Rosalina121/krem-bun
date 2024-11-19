import React, { useEffect, useState } from "react";
import "./SimsWaiting.css";
import theKrems from "../assets/images/krems.png"

export default function SimsWaiting() {


  const [quip1, setQuip1] = useState("1")
  const [quip2, setQuip2] = useState("1")
  const [nextQuip, setNextQuip] = useState(0)   // can start from anywhere

  useEffect(() => {
    const quips: string[] = [
      "Pieczenie kremówek",
      "Śpiewanie barki",
      "Instalowanie OBSa",
      "Modelowanie krawędzi",
      "Kompilacja shaderów",
      "Napełnianie basenów",
      "Ściąganie zadań domowych",
      "Topienie Simów w basenie",
      "Nie chcę darmowych słuchawek",
      "Wymyślanie tego tekstu",
      "Rysowanie czcionek",
      "Farbowanie włosów",
      "Szycie brzdkich swetrów",
      "Zachwycanie się nad żabami",
      "Zamawianie Iced Latte Venti Lorem Ipsum",
      "OK.",
      "Rysowanie na ławkach",
      "Opierdalanie dupy profesorom",
      "Szkalowanie papieża"
    ];

    const interval1 = setTimeout(() => {
      setQuip2(quips[nextQuip]);
    }, 3000)
    const interval2 = setTimeout(() => {
      if (nextQuip + 1 >= quips.length) {
        setQuip1(quips[0]);
        setNextQuip(1)
      } else {
        setQuip1(quips[nextQuip + 1]);
        setNextQuip(nextQuip + 2 >= quips.length ? 0 : nextQuip + 2)
      }
    }, 6000);

    return () => {
      clearTimeout(interval1);
      clearTimeout(interval2);
    };
  }, [nextQuip]);



  return (
    <div className="h-screen bg-[#1B4880] flex flex-row items-center justify-center">
      <div
        className="h-full aspect-[4/3] bg-[#004494] relative flex flex-col items-center justify-evenly text-[#73ACD6] font-[Comic] text-4xl"
        style={{
          boxShadow: `
            inset -4px -4px 8px rgba(0, 0, 0, 0.5),
            inset 4px 4px 8px rgba(255, 255, 255, 0.5),
            4px 4px 8px rgba(0, 0, 0, 0.3)
          `,
          border: '4px solid',
          borderColor: 'rgba(255, 255, 255, 0.8) rgba(0, 0, 0, 0.6) rgba(0, 0, 0, 0.6) rgba(180, 180, 180, 0.6)'
        }}
      >
        <div
          className="absolute inset-0"
          style={{
            background: 'linear-gradient(135deg, rgba(255,255,255,0.15) 0%, rgba(255,255,255,0.08) 30%, rgba(0,0,0,0.08) 70%, rgba(0,0,0,0.15) 100%)'
          }}
        />
        <div className="h-[60%] flex items-center justify-center">
          <img src={theKrems} alt="" />
        </div>
        <span>(c)2024 dupa.gay. Wszystkie prawa osób trans to prawa ludzi.</span>

        <div className="w-full overflow-hidden h-12 relative">
          <div className="relative w-full h-full">
            <span className="absolute animate-scroll-fast">{quip1}</span>
            <span className="absolute animate-scroll-fast-delayed">{quip2}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
