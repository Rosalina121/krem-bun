import React from "react";
import { useEffect } from "react"
import useWebSocket, { ReadyState } from "react-use-websocket"
import { DeckAction, DeckMessage, DeckMessageType, Message, MessageEvent } from "../../common/types";

interface DeckButton {
  type: DeckMessageType;
  desc: string;
  color: string;
}
export default function Deck() {
  const pink = "#f03580"
  const blue = "#49bff5"
  const green = "#9ded74"
  const gray = "#adadad"


  const buttons: DeckButton[] = [
    // row 1
    { type: DeckMessageType.OBS, desc: "Krem Godot", color: pink },
    { type: DeckMessageType.NONE, desc: "", color: "" },
    { type: DeckMessageType.VNYAN, desc: "Reset Pos", color: blue },
    { type: DeckMessageType.NONE, desc: "", color: "" },
    { type: DeckMessageType.OBS, desc: "Krem Godot Zoom", color: green },
    // row 2
    { type: DeckMessageType.OBS, desc: "BRB", color: pink },
    { type: DeckMessageType.NONE, desc: "", color: "" },
    { type: DeckMessageType.NONE, desc: "", color: "" },
    { type: DeckMessageType.NONE, desc: "", color: "" },
    { type: DeckMessageType.NONE, desc: "", color: "" },
    // row 3
    { type: DeckMessageType.OBS, desc: "BSOD", color: pink },
    { type: DeckMessageType.NONE, desc: "", color: "" },
    { type: DeckMessageType.NONE, desc: "", color: "" },
    { type: DeckMessageType.NONE, desc: "", color: "" },
    { type: DeckMessageType.GODOT, desc: "Change Aspect", color: green },
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
      <h1 className="mb-8">Deck</h1>
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
                  const message: DeckMessage = {
                    event: MessageEvent.DECK,
                    type: button.type,
                    data: {
                      color: button.color,
                      desc: button.desc
                    }
                  }
                  sendJsonMessage(message)
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
