import React, { useState } from "react";
import { useEffect } from "react"
import useWebSocket, { ReadyState } from "react-use-websocket"
import { DeckAction, DeckMessage, DeckMessageType, Message, MessageEvent, emotions, Emotion } from "../../common/types";

interface DeckButton {
  type: DeckMessageType;
  desc: string;
  color: string;
  hasModal?: boolean;
}

// colors
const pink = "#f03580"
const blue = "#49bff5"
const green = "#9ded74"
const gray = "#adadad"
const orange = "#ffb086"
const lavender = "#e0b0ff"
const mint = "#98ff98"
const peach = "#ffdab9"
const sky = "#87ceeb"
const rose = "#ffb7c5"
const lime = "#d0ff14"
const coral = "#ff9d76"
const turquoise = "#afeeee"
const mauve = "#e0b0ff"
const yellow = "#fdfd96"
const cyan = "#a0e6ff"

// Utility function to determine if a color is light
const isLightColor = (hexColor: string): boolean => {
  // Remove # if present
  const hex = hexColor.replace('#', '');

  // Convert hex to RGB
  const r = parseInt(hex.slice(0, 2), 16);
  const g = parseInt(hex.slice(2, 4), 16);
  const b = parseInt(hex.slice(4, 6), 16);

  // Calculate brightness (using perceived brightness formula)
  // Returns value between 0 (darkest) and 255 (lightest)
  const brightness = (r * 299 + g * 587 + b * 114) / 1000;

  // Return true if color is light (brightness > 155 is a good threshold)
  return brightness > 155;
};

// Utility function to get text color based on background
const getTextColor = (bgColor: string): string => {
  return isLightColor(bgColor) ? 'text-gray-700' : 'text-white';
};

// Modal component
const Modal = ({ isOpen, onClose, title, children }: {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div className="bg-gray-800 p-6 rounded-xl max-w-[90vw] max-h-[90vh] overflow-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-white text-xl font-bold">{title}</h2>
          <button
            onClick={onClose}
            className="text-white hover:text-gray-300"
          >
            ✕
          </button>
        </div>
        {children}
      </div>
    </div>
  );
};

// Mario Kart Modal
const MarioKartModal = ({ onClose, sendJsonMessage }: {
  onClose: () => void;
  sendJsonMessage: (message: any) => void;
}) => {
  const marioKartActions = [
    { desc: "Blue Shell", color: sky },
    { desc: "Piorunek", color: yellow },
    { desc: "COCONUT MALL'D", color: coral },
    { desc: "Communication Error", color: mauve },
  ];

  // Calculate optimal number of columns based on number of items
  const numItems = marioKartActions.length;
  const columnClass = numItems <= 4 ? 'grid-cols-2' :
    numItems <= 6 ? 'grid-cols-3' :
      'grid-cols-4';

  return (
    <div className={`grid ${columnClass} gap-2 w-fit`}>
      {marioKartActions.map((action) => (
        <button
          key={action.desc}
          className={`hover:brightness-90 p-4 rounded-xl w-48 h-32 relative ${getTextColor(action.color)}`}
          style={{ backgroundColor: action.color }}
          onClick={() => {
            const message: DeckMessage = {
              event: MessageEvent.DECK,
              type: DeckMessageType.OVERLAY,
              data: {
                color: action.color,
                desc: action.desc
              }
            };
            sendJsonMessage(message);
            onClose();
          }}
        >
          <span className={`absolute inset-0 flex items-center justify-center text-center px-2 text-lg font-bold break-words`}>
            {action.desc}
          </span>
        </button>
      ))}
    </div>
  );
};

// Sims 4 Emotions Modal
const EmotionsModal = ({ onClose, sendJsonMessage }: {
  onClose: () => void;
  sendJsonMessage: (message: any) => void;
}) => {
  // Calculate optimal number of columns based on number of items
  const numItems = emotions.length;
  const columnClass = numItems <= 4 ? 'grid-cols-2' :
    numItems <= 9 ? 'grid-cols-3' :
      'grid-cols-4';

  return (
    <div className={`grid ${columnClass} gap-2 w-fit max-h-[70vh] overflow-y-auto`}>
      {emotions.map((emotion) => (
        <button
          key={emotion.emotion}
          className={`hover:brightness-90 p-4 rounded-xl w-48 h-32 relative ${getTextColor(emotion.color)}`}
          style={{ backgroundColor: emotion.color }}
          onClick={() => {
            const message: DeckMessage = {
              event: MessageEvent.DECK,
              type: DeckMessageType.OVERLAY,
              data: {
                color: emotion.color,
                desc: emotion.emotion // Using emotion as description
              }
            };
            sendJsonMessage(message);
            onClose();
          }}
        >
          <span className={`absolute inset-0 flex items-center justify-center text-center px-2 text-lg font-bold break-words`}>
            {emotion.emotion}
          </span>
        </button>
      ))}
    </div>
  );
};

const MODAL_COMPONENTS: Record<string, React.FC<{
  onClose: () => void;
  sendJsonMessage: (message: any) => void;
}>> = {
  "Mario Kart": MarioKartModal,
  "Emotions": EmotionsModal,
};

const buttons: DeckButton[] = [
  // row 1
  { type: DeckMessageType.OBS, desc: "Krem Godot", color: pink },
  { type: DeckMessageType.OBS, desc: "Krem Godot Zoom", color: pink },
  { type: DeckMessageType.OVERLAY, desc: "Change Aspect", color: green },
  { type: DeckMessageType.NONE, desc: "", color: "" },
  { type: DeckMessageType.VNYAN, desc: "Reset Pos", color: blue },
  // row 2
  { type: DeckMessageType.OBS, desc: "BRB", color: pink },
  { type: DeckMessageType.NONE, desc: "", color: "" },
  { type: DeckMessageType.OVERLAY, desc: "Mario Kart", color: orange, hasModal: true },
  { type: DeckMessageType.NONE, desc: "", color: "" },
  { type: DeckMessageType.NONE, desc: "", color: "" },
  // row 3
  { type: DeckMessageType.OBS, desc: "BSOD", color: pink },
  { type: DeckMessageType.NONE, desc: "", color: "" },
  { type: DeckMessageType.OVERLAY, desc: "Emotions", color: orange, hasModal: true },
  { type: DeckMessageType.NONE, desc: "", color: "" },
  { type: DeckMessageType.NONE, desc: "", color: "" },
];

export default function Deck() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeModal, setActiveModal] = useState<string | null>(null);



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
    <div className="flex flex-col m-8">
      <h1 className="mb-8">Deck</h1>
      <div className="flex flex-col items-center justify-center">
        <div className="grid grid-cols-5 gap-2 ">
          {buttons.map((button, i: number) => (
            <div
              key={i}
              className={`relative w-48 h-48 select-none rounded-xl text-center ${button.desc ? "cursor-pointer" : ""
                }`}
              style={{
                backgroundColor: button.color || gray
              }}
              onClick={() => {
                if (button.desc) {
                  if (button.hasModal) {
                    setActiveModal(button.desc);
                    setIsModalOpen(true);
                  } else {
                    const message: DeckMessage = {
                      event: MessageEvent.DECK,
                      type: button.type,
                      data: {
                        color: button.color,
                        desc: button.desc
                      }
                    };
                    sendJsonMessage(message);
                  }
                }
              }}
            >
              <span className={`absolute inset-0 flex items-center justify-center font-bold text-2xl ${getTextColor(button.color || gray)}`}>
                {button.desc}
              </span>
            </div>
          ))}
        </div>
      </div>
      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setActiveModal(null);
        }}
        title={activeModal || ""}
      >
        {activeModal && MODAL_COMPONENTS[activeModal] && React.createElement(
          MODAL_COMPONENTS[activeModal],
          {
            onClose: () => setIsModalOpen(false),
            sendJsonMessage: sendJsonMessage,
          }
        )}
      </Modal>
    </div>
  );
}
