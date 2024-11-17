import React, { useEffect, useState, useRef } from 'react';
import useWebSocket, { ReadyState } from "react-use-websocket"
import {
  AudioStream,
  AudioStreamPlayer,
  Label,
  NodeUi,
  PathFollow,
} from "./icons";

import { IoEyeSharp } from "react-icons/io5";
import { FiPlus } from "react-icons/fi";
import { FaSquareFull, FaSortAmountUp } from "react-icons/fa";
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

interface ChatMessage {
  type: OverlayMessageType,
  id: number,
  author: string,
  message: string,
  color: string,
  exiting?: boolean,
  entering?: boolean,
}

export default function Godot() {
  // Messages
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [nextId, setNextId] = useState(0); // State to keep track of the next message ID
  const containerRef = useRef<HTMLDivElement>(null); // Reference to the message container

  // 16:9
  const [wide, setWide] = useState(true);

  // Songs
  const [song, setSong] = useState("Nothing playing yet...");

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
      console.log("WS", lastMessage)
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
              case "Change Aspect":
                setWide(!wide);
                break;
              // Mario Kart cases
              case "Blue Shell":
                setCounter({ ...counter, blueshells: counter.blueshells + 1 })
                break;
              case "Piorunek":
                setCounter({ ...counter, piorunki: counter.piorunki + 1 })
                break;
              case "COCONUT MALL'D":
                setCounter({ ...counter, coconutmalled: counter.coconutmalled + 1 })
                break;
              case "Communication Error":
                setCounter({ ...counter, errors: counter.errors + 1 })
                break;
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

  return (
    <div className="flex flex-row overflow-hidden h-screen">
      <div className="flex flex-col w-[480px] bg-[#062026] p-2">
        {/* Tabs */}
        <div className="flex flex-row bg-[#072930]">
          <div className="bg-[#0A3B45] px-2 py-1 border-t-2 border-blue-500 text-white text-center">
            Scene
          </div>
          <div className="px-2 pt-1.5 text-gray-400 w-full">
            Import
          </div>
          <BsThreeDotsVertical className="text-gray-400 text-3xl self-center" />
        </div>
        {/* Buttons */}
        <div className="flex flex-row bg-[#0A3B45] text-white text-2xl p-1 gap-2 items-center -mb-1">
          <FiPlus />
          <PiLinkSimpleBold />
          <div className="flex flex-row bg-[#072930] text-base text-gray-300 border-b-2 border-black items-center py-1 px-2 grow justify-between">
            Filter: name, t:type, g:group
            <IoMdSearch />
          </div>
          <BsThreeDotsVertical />
        </div>
        {/* Messages */}
        <div className="flex flex-col bg-[#0A3B45] p-1">
          <div
            className="flex flex-col h-[605.5px] overflow-hidden bg-[#06252B] pt-2"
            ref={containerRef} // Reference to the message container
          >
            <div className={`flex flex-col mx-2 -mt-1`}>
              <div className="flex flex-row items-center">
                <RiArrowDropDownLine className="text-gray-300 text-3xl -m-1" />
                <AudioStreamPlayer className="mr-2" />
                <span className="text-white w-full">
                  AudioStreamPlayer
                </span>
                <div className="text-white text-xl ml-2">
                  <PiEyeClosedBold />{" "}
                </div>
              </div>
              <div className="flex flex-row items-start w-full">
                <div className=" w-12 flex-row flex mr-2 translate-y-1">
                  <GrBottomCorner className="text-gray-500 origin-right translate-y-[0.165rem] rotate-90" />
                  <BsDashLg className="text-gray-500" />
                  <AudioStream className="" />
                </div>

                <div className="flex text-yellow-300 w-full">
                  {song || "Nothing playing yet..."}
                </div>
                <div className="text-white text-xl translate-y-1 ml-2">
                  <PiEyeClosedBold />{" "}
                </div>
              </div>
            </div>
            {messages.map((message) => (
              <div
                key={message.id} // Use the unique ID as the key
                className={`flex flex-col mx-2 mt-1 transition-all duration-200 ease-in-out ${message.exiting
                  ? "-translate-x-full opacity-100" // Slide out to the left with full opacity
                  : message.entering
                    ? "-translate-x-full" // Fade in from opacity 0
                    : "translate-x-0 opacity-100" // Fully on screen with full opacity
                  }`}
              >
                <div className="flex flex-row items-center">
                  <RiArrowDropDownLine className="text-gray-300 text-3xl -m-1" />
                  {message.type == OverlayMessageType.CHAT ? (
                    <NodeUi
                      className="mr-2"
                      style={{ color: message.color }}
                    />
                  ) : (
                    <PathFollow
                      className="mr-2"
                      style={{ color: message.color }}
                    />
                  )}

                  <span className="text-white w-full">
                    {message.author}
                  </span>
                  <div className="text-white text-xl ml-2">
                    <IoEyeSharp />
                  </div>
                </div>
                <div className="flex flex-row items-start w-full">
                  <div className=" w-12 flex-row flex mr-2 translate-y-1">
                    <GrBottomCorner className="text-gray-500 origin-right translate-y-[0.165rem] rotate-90" />
                    <BsDashLg className="text-gray-500" />
                    <Label
                      className=""
                      style={{ color: message.color }}
                    />
                  </div>

                  <div
                    className={`flex ${message.type === OverlayMessageType.FOLLOW
                      ? "text-yellow-300"
                      : "text-white"
                      } w-full`}
                  >
                    {message.message}
                  </div>
                  <div className="text-white text-xl translate-y-1 ml-2">
                    <IoEyeSharp />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Tabs */}
        <div className="flex flex-row bg-[#072930] mt-1">
          <div className="bg-[#0A3B45] px-2 py-1 border-t-2 border-blue-500 text-white text-center">
            FileSystem
          </div>
          <div className="px-2 pt-1.5 text-gray-400 w-full">
            History
          </div>
          <BsThreeDotsVertical className="text-gray-400 text-3xl self-center" />
        </div>
        {/* Buttons */}
        <div className="flex flex-row bg-[#0A3B45] text-white text-2xl p-1 gap-2 items-center pr-2 -mb-1">
          <RiArrowLeftWideFill />
          <RiArrowRightWideFill />
          <div className="flex flex-row bg-[#072930] text-base text-gray-300 border-b-2 border-black items-center py-1 px-2 grow justify-between">
            res://models/vrm/kremówka.vrm
            <IoMdSearch />
          </div>
          <FaSquareFull />
        </div>
        {/* Buttons */}
        <div className="flex flex-row bg-[#0A3B45] text-white text-2xl p-1 gap-2 items-center pr-2 -mb-1">
          <div className="flex flex-row bg-[#072930] text-base text-gray-300 border-b-2 border-black items-center py-1 px-2 grow justify-between">
            Filter files
            <IoMdSearch />
          </div>
          <FaSortAmountUp />{" "}
        </div>
        {/* File system */}
        <div className="flex flex-col grow bg-[#0A3B45] p-1 ">
          <div className="flex bg-[#06252B] grow"></div>
        </div>
      </div>

      {/* Set to false for 4:3 */}
      {wide && (
        <div className="flex w-[1440px] flex-col">
          <div className="bg-red-500 opacity-0 aspect-[16/9]"></div>
          <div className="bg-[#062026] pb-3 pt-2 pr-2 h-[270px] flex flex-col">
            {/* Debugger */}
            <div className="flex flex-col grow bg-[#0A3B45] p-1">
              <div className="flex text-white font-mono text-4xl flex-col overflow-hidden grow bg-[#06252B] p-2 w-full justify-between">
                {/* Cols */}
                <div className='flex flex-row'>
                  {/* Col 1 */}
                  <div className='flex flex-col w-1/2'>
                    <span className='text-blue-400'>💥 Blueshelle: {counter.blueshells}</span>
                    <span className='text-rose-300'>🛒 COCONUT MALL'D: {counter.coconutmalled}</span>
                  </div>
                  {/* Col 2 */}
                  <div className='flex flex-col '>
                    <span className='text-yellow-300'>⚡ Piorunki: {counter.piorunki}</span>
                    <span className='text-red-500'>⚠️ Communication Errory: {counter.errors}</span>
                  </div>
                </div>
                {/* Footer */}
                <div className='overflow-hidden text-nowrap'>
                  {displayText}<span className={`text-bold ${""} ${blip ? "" : "opacity-0"}`}>█</span>
                </div>
              </div>
            </div>
            {/* Buttons */}
            <div className="flex flex-row bg-[#0A3B45] text-white text-2xl p-1 gap-2 items-center -mb-1">
              <div className="flex flex-row bg-[#072930] text-base text-gray-300 border-b-2 border-black items-center py-1 px-2 grow justify-between">
                Filter Messages
                <IoMdSearch />
              </div>
            </div>
            {/* Buttons */}
            <div className="flex flex-row bg-[#0A3B45] text-white p-2 gap-4 items-center -mb-1 text-base">
              <span className="text-blue-500">• Output</span>
              <span>Debugger</span>
              <span>Audio</span>
              <span>Animation</span>
              <span>Shader Editor</span>
              <span>Version Control</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
