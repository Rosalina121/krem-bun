import React from "react";
import { useEffect } from "react"
import useWebSocket, { ReadyState } from "react-use-websocket"

export default function Deck() {
  const pink = "#f03580"
  const blue = "#49bff5"
  const green = "#9ded74"
  const gray = "#adadad"

  interface Action {
    desc: string;
    color: string;
  }

  const buttons: Action[] = [
    // row 1
    { desc: "Scene Main", color: pink },
    { desc: "", color: "" },
    { desc: "Reset Pos", color: blue },
    { desc: "", color: "" },
    { desc: "Zoom", color: green },
    // row 2
    { desc: "Scene Brb", color: pink },
    { desc: "", color: "" },
    { desc: "", color: "" },
    { desc: "", color: "" },
    { desc: "", color: "" },
    // row 3
    { desc: "Scene BSOD", color: pink },
    { desc: "", color: "" },
    { desc: "", color: "" },
    { desc: "", color: "" },
    { desc: "Change Aspect", color: green },
    // row 4
    // { desc: "", color: "" },
    // { desc: "", color: "" },
    // { desc: "", color: "" },
    // { desc: "", color: "" },
    // { desc: "", color: "" },
  ];

  const WS_URL = "ws://localhost:3000/ws"
  const { sendJsonMessage, lastMessage, readyState } = useWebSocket(
    WS_URL,
    {
      share: false,
      shouldReconnect: () => true,
    },
  )

  // Run when the connection state (readyState) changes
  useEffect(() => {
    console.log("Connection state changed")
    if (readyState === ReadyState.OPEN) {
      sendJsonMessage({
        event: "subscribe",
        data: {
          payload: "Deck!",
        },
      })
    }
  }, [readyState])

  return (
    <div className="flex flex-col m-4">
      <h1>Deck</h1>
      <div className="flex flex-col items-center justify-center">
        <div className="grid grid-cols-5 gap-2 ">
          {buttons.map((button, i: number) => (
            <div
              key={i}
              className={`relative w-48 h-48 rounded-xl text-center ${button.desc ? "cursor-pointer" : ""
                }`}
              style={{
                backgroundColor: button.color || gray
              }}
              onClick={() => {
                if (button.desc) {
                  sendJsonMessage({
                    event: "deck",
                    type: button.desc
                  })
                }
              }}
            >
              <span className=" drop-shadow-sims absolute inset-0 flex items-center justify-center text-white font-bold text-2xl">
                {button.desc}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
