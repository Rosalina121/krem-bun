import React, { useEffect, useState, useRef } from 'react';
import useWebSocket, { ReadyState } from "react-use-websocket"
import {
  AudioStream,
  AudioStreamPlayer,
  Label,
  NodeUi,
  PathFollow,
} from "./icons";

import { IoEyeSharp, IoMusicalNotes } from "react-icons/io5";
import { FiPlus } from "react-icons/fi";
import { FaSquareFull, FaSortAmountUp, FaTrashAlt } from "react-icons/fa";
import { PiLinkSimpleBold, PiEyeClosedBold } from "react-icons/pi";
import { BsThreeDotsVertical, BsDashLg } from "react-icons/bs";
import { IoMdSearch } from "react-icons/io";
import {
  RiArrowDropDownLine,
  RiArrowLeftWideFill,
  RiArrowRightWideFill,
} from "react-icons/ri";
import { GrBottomCorner } from "react-icons/gr";
import { MarioKartCounter, MessageEvent, OverlayMessageType } from '../../common/types';
import { lerpStrings } from '../utils/lerpStrings';
import "./Sims4.css";

interface ChatMessage {
  type: OverlayMessageType,
  id: number,
  author: string,
  message: string,
  color: string,
  exiting?: boolean,
  entering?: boolean,
  time?: string,
  pictureURL?: string,
}

interface Emotion {
  color: string,
  desc: string,
}

export default function Sims4() {
  // Messages
  // const [messages, setMessages] = useState<ChatMessage[]>([])
  // const [nextId, setNextId] = useState(0); // State to keep track of the next message ID
  const containerRef = useRef<HTMLDivElement>(null); // Reference to the message container

  const testMessages: ChatMessage[] = [
    {
      type: OverlayMessageType.CHAT,
      id: 0,
      author: "TestUser123",
      message: "Hello, this is a test message!",
      color: "#FF6395",
      time: new Date().toLocaleTimeString('en-GB')
    },
    {
      type: OverlayMessageType.CHAT,
      id: 1,
      author: "CoolPerson456",
      message: "This is a longer test message with some more content in it.",
      color: "#FF6395",
      pictureURL: "https://i.imgur.com/4M34hi2.jpg",
      time: new Date().toLocaleTimeString('en-GB')
    },
    {
      type: OverlayMessageType.CHAT,
      id: 2,
      author: "DebugMaster789",
      message: "And here's an even longer message that tests how the component handles more substantial content while still keeping it reasonable.",
      color: "#FF6395",
      time: new Date().toLocaleTimeString('en-GB')
    }
  ];

  const [messages, setMessages] = useState<ChatMessage[]>(testMessages);
  const [nextId, setNextId] = useState(3); // Start from 3 since we have 3 test messages

  // 16:9
  const [wide, setWide] = useState(true);

  // Songs
  const [song, setSong] = useState("Nothing playing yet...");
  const [shouldScroll, setShouldScroll] = useState(false);
  const textRef = useRef<HTMLDivElement>(null);

  // Counters
  // -2 as default to test if deck works before stream, as I don't have subtract lol
  const [counter, setCounter] = useState<MarioKartCounter>({ blueshells: -2, coconutmalled: -2, piorunki: -2, errors: -2 });

  // Wide changing text
  const quotes: string[] = [
    // Max len: 64
    // So, max to here ----------------------------------------------", (65-1 for blink)

    "AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA",
    "Oh my godot",
    "Certified girlfailure",
    "sudo rm -rf / --no-preserve-root",
    "Gdyby mi się chciało tak jak mi się nie chce",
    "Dlaczego jeszcze nie używasz Firefoxa?",
    "I've been here, the WHOLE TIME",
    "Tak jak pan jezus powiedział",
    "Jeszcze jak",
    "Życie jest jak but, zaplątane jak sznurówki",
    "Ea-nāṣir sprzedaje niskiej jakości miedź, nie polecam 2/10",
    "Peace was never an option",
    "Jakiś skibidi jeleń goni mnie",
    "Picie, chipsy... Człowiek nie potrzebuje nic więcej do życia",
    "Albercik, wychodzimy",
    "Twarz to mu chyba Michał Anioł dłutem charatał",
    "Lubię placki",
    "Down, down, down the Road, down the Witches' Road",
    "GNU/Linux > macOS > kupka gówna > Windows",
    "Ten efekt tekstu jest autorstwa ravarcheon.com",
    "Mario Kart 8 Deluxe Booster Course Pass for the Nintendo Switch™",
    "Jak dorosnę, chcę być jak Hatsune Miku",
    "JAK SIĘ TU WYŁĄCZA CAPS LOCKA",
    "Walić twittera, wszyskie moje ziomki walą twittera",
    "Segmentation fault (core dumped)",
    `{"sts":"401","res":"OpenAI ChatGPT error. Insufficient tokens."}`,
    "phpBB modified by Przemo wróć",
    "☆*:.｡.o(≧▽≦)o.｡.:*☆",
    "(╯°益°)╯彡┻━┻",
    "( ͡° ͜ʖ ͡°)",
    "UwU",
    "🏳️‍⚧️ Trans rights are human rights 🏳️‍⚧️",
    "Ayayayayayayayayayayayayayayayayaya~~",
    "Powered by pizzerka z Lidla",
    "Patronat medialny: PaliTechnika",
    "NIE W4RTO",
    "40% TypeScript, 40% CSS, 40% Spaghetti",
    "ai generate DEEZ NUTS",
    "Przegrywasz Grę",
    "3 stock, No items, Fox only, Final Destination",
    "a ja jestem druidem i wale z różdżki",
    "Sieci@ki ostrzegały przede mną",
    "Miłość do czosnkowej bagiety i drugiej kobiety",
    "Dzień dobry, dla mnie łagodny falafel yyy... na cienkim",
    "I'm really feelin' it!",
    "krem@dupa.gay:~$ sudo rm rf / --no-preserve-root",
    "#nofilter",
    "Moim zdaniem to nie ma tak, że dobrze, albo że niedobrze",
    "Sul sul!",
    "I'm using tilt controls!",
    "Te prymitywne dowcipy, mongolskie dialogi...",
    "Hemoglobina, halucynacja, taka - sytuacja"
  ]
  const [displayText, setDisplayText] = useState("Ten efekt tekstu jest autorstwa ravarcheon.com");
  const [currentText, setCurrentText] = useState("Ten efekt tekstu jest autorstwa ravarcheon.com")
  const [blip, setBlip] = useState(false)
  const [isAnimating, setIsAnimating] = useState(false)
  function easeInOutCubic(t: number): number {
    return t < 0.5 ? 2 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 4;
  }

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
          payload: "Godot!",
        },
      })
    }
  }, [readyState])

  // Run when a new WebSocket message is received (lastJsonMessage)
  useEffect(() => {
    if (lastMessage) {
      const parsed = JSON.parse(lastMessage.data)
      // console.log("parsed:", parsed)
      if (parsed.event === MessageEvent.OVERLAY) {
        switch (parsed.type) {
          case OverlayMessageType.MUSIC:
            if (!parsed.data.title && !parsed.data.album && !parsed.data.artist) {
              setSong("Awaiting some tunes...")
            } else {
              setSong(`${parsed.data.title} ${parsed.data?.album && "from " + parsed.data.album} ${parsed.data?.artist && "by " + parsed.data.artist}`)
            }
            break;
          case OverlayMessageType.ACTION:
            console.log("Action received:", parsed.data.action)
            switch (parsed.data.action) {
              default:
                console.warn("Unknown action:", parsed.data.action)
            }
            break;
          default:  // we assume default is chat/follow
            const newChatMessage = parsed.data

            const newMessage: ChatMessage = {
              type: parsed.type,
              ...newChatMessage,
              id: nextId, // Assign a unique ID based on the current nextId
              entering: true, // New message is entering
              time: new Date().toLocaleTimeString('en-GB')
            };
            console.log("Msg with id:", newMessage.id)

            setMessages((prevMessages) => [...prevMessages, newMessage])
            setNextId((prevId) => prevId + 1); // Increment the ID for the next message

            // Timeout to update the 'entering' state (needed for animations/transitions)
            const enteringTimer = setTimeout(() => {
              setMessages((prevMessages) =>
                prevMessages.map((msg) =>
                  msg.id === newMessage.id
                    ? { ...msg, entering: false }
                    : msg
                )
              );
            }, 0); // Timeout with 0ms to allow React to finish rendering

            // Cleanup function to clear the timeout if the component unmounts
            return () => {
              clearTimeout(enteringTimer);
            };
        }
      }
    }
  }, [lastMessage])

  // Handle message overflow
  useEffect(() => {
    function removeMessage(messageId: number) {
      setMessages((prevMessages) =>
        prevMessages.map((message) =>
          message.id === messageId
            ? { ...message, exiting: true }
            : message
        )
      );

      setTimeout(() => {
        setMessages((prevMessages) =>
          prevMessages.filter((message) => message.id !== messageId)
        );
      }, 200); // Wait for the exit animation to complete before removing
    }

    function removeOverflowingMessages() {
      if (containerRef.current) {
        const containerHeight = containerRef.current.clientHeight;
        const messagesHeight = containerRef.current.scrollHeight;

        if (messagesHeight > containerHeight) {
          // Remove the first message when overflowing
          const firstMessage = messages[0];
          if (firstMessage) {
            removeMessage(firstMessage.id);
            console.log("removing msg:", firstMessage)
          }
        }
      }
    }

    removeOverflowingMessages(); // Check for overflow whenever messages change
  }, [messages]); // Trigger this effect whenever the messages array changes

  // Random quotes with the ravarcheon's (@ravarcheon.com) string-lerp
  const animateText = () => {
    let start = 0;
    const duration = 6000;
    const interval = 10;
    let randomQuote: string;
    // Random but check if same
    do {
      randomQuote = quotes[Math.floor(Math.random() * quotes.length)];
    } while (randomQuote == currentText)

    setIsAnimating(true)
    setBlip(false)

    const animation = setInterval(() => {
      start += interval;
      const t = Math.min(start / duration, 1);
      const easedT = easeInOutCubic(t)
      setDisplayText(lerpStrings(currentText, randomQuote, easedT));
      if (t === 1) {
        clearInterval(animation);
        setCurrentText(randomQuote)
        setIsAnimating(false)
      }
    }, interval);
  };
  useEffect(() => {
    // Set timeout to run animateText every 4 seconds
    const timeoutId = setTimeout(animateText, 4000);

    // Clear interval on unmount
    return () => clearTimeout(timeoutId);
  }, [currentText]); // Dependency on currentText to ensure it updates after each animation
  useEffect(() => {
    // Set interval to animate blip
    const intervalId = setInterval(() => {
      if (!isAnimating) setBlip(!blip)
    }, 500);

    // Clear interval on unmount
    return () => clearInterval(intervalId);
  }, [blip, isAnimating]); // Dependency on blip to ensure it updates after each animation

  // Scroll song
  useEffect(() => {
    if (textRef.current) {
      setShouldScroll(textRef.current.scrollWidth > textRef.current.clientWidth);
    }
  }, [song]);

  return (
    <div className="flex flex-row overflow-hidden">
      <div className="w-[480px]">
        <div className="flex flex-col h-full">
          {/* Messages Container */}
          <div
            className="flex flex-col h-[568px] overflow-hidden p-2"
          >
            <div className='w-0 h-0 ml-[20em] border-l-[1em] border-l-transparent border-b-[1em] border-r-transparent border-r-[1em] border-b-slate-300/50'>
            </div>
            <div className='h-12 bg-slate-300/50 rounded-t-xl flex items-center pl-4'>
              <FaTrashAlt className='text-2xl text-white drop-shadow-sims' />
            </div>

            <div
              className='flex flex-col overflow-hidden bg-slate-100/65 rounded-b-xl'
              ref={containerRef} // Reference to the message container
            >
              {messages.map((message) => (
                <div
                  key={message.id} // Use the unique ID as the key
                  style={{boxShadow: "0 2px 6px rgba(0, 0, 0, 0.4)"}}
                  className={`flex flex-col bg-blue-500 rounded-md m-2 transition-all duration-200 ease-in-out ${message.exiting
                    ? "-translate-x-full opacity-100" // Slide out to the left with full opacity
                    : message.entering
                      ? "-translate-x-full" // Fade in from opacity 0
                      : "translate-x-0 opacity-100" // Fully on screen with full opacity
                    }`}
                >
                  <div className="flex flex-row-reverse py-1 px-2 w-full bg-blue-400 rounded-t-md">
                    <div className="text-blue-800">
                      {message.time}
                    </div>
                  </div>
                  <div className="flex flex-row gap-3 justify-start p-2">
                    <img
                      src={
                        message.pictureURL ||
                        "https://test.palitechnika.com/Transgender_Pride_flag.png"
                      }
                      alt=""
                      className="w-12 h-12 rounded-md"
                    />
                    <div className="bg-blue-600 p-1 rounded-md flex flex-row flex-wrap items-center">
                      <div className="text-white drop-shadow-sims">
                        <span className="font-bold">
                          {message.author}:
                        </span>{" "}
                        {message.message}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

          </div>
          <div className="flex flex-col-reverse h-[32rem] relative overflow-hidden">
            <div
              className="w-[60rem] h-[60rem] rounded-full absolute z-0"
              style={{
                backgroundImage: `radial-gradient(circle, ${"red"} 40%, transparent 90%)`,
                clipPath:
                  "polygon(50% 0%, 100% 0%, 100% 50%, 50% 50%)",
                left: "-30rem",
                bottom: "-30rem",
              }}
            ></div>

            <div className="w-[480px] h-[4rem] bg-gradient-to-t from-white/80 to-white/50 z-10">
              <div className="flex flex-row items-center p-2 gap-2 drop-shadow-sims mt-2">
                <IoMusicalNotes className="text-white text-2xl flex-shrink-0" />
                <div className="overflow-hidden">
                  <div
                    ref={textRef}
                    className={`text-white  text-2xl font-bold whitespace-nowrap
                        ${shouldScroll ? 'scrolling-text' : ''}`}
                  >
                    <span className="px-4">{song}</span>
                    {shouldScroll && <span className="px-4">{song}</span>}
                  </div>
                </div>
              </div>
            </div>

            <div className="z-10 origin-top-left -rotate-90 text-white text-5xl uppercase ml-4 -mb-6 drop-shadow-sims"
              style={{ fontFamily: "Metropolis" }}>
              emotion
            </div>
          </div>
        </div>
      </div>

      {/* Right side background */}
      <div className="bg-slate-500 h-screen aspect-[4/3]"></div>
    </div>
  );
}
