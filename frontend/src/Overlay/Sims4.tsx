import React, { useEffect, useState, useRef } from 'react';
import useWebSocket, { ReadyState } from "react-use-websocket"

import { IoMusicalNotes } from "react-icons/io5";
import { FaTrashAlt } from "react-icons/fa";
import { PiWifiMediumBold } from "react-icons/pi";
import { MdOutlinePhoneIphone } from 'react-icons/md';
import { ImPacman } from 'react-icons/im';

import { Emotion, emotions, MarioKartCounter, MessageEvent, OverlayMessageType } from '../../../common/types';
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

export default function Sims4() {
  // Messages
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [nextId, setNextId] = useState(0); // State to keep track of the next message ID
  const containerRef = useRef<HTMLDivElement>(null); // Reference to the message container

  // Follows
  const [showFollow, setShowFollow] = useState(false);
  const [followAnimation, setFollowAnimation] = useState('follow-enter');
  const [follower, setFollower] = useState({ name: '', pictureURL: '' });

  // 16:9
  const [wide, setWide] = useState(true);

  // Emotions
  const [emotion, setEmotion] = useState<Emotion>(emotions[1]) // default is happy

  // Songs
  const [song, setSong] = useState("Nothing playing yet... But longer now");
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
          payload: "Sims4!",
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
          case OverlayMessageType.ACTION: {
            console.log("Action received:", parsed.data.action)
            const foundEmotion = emotions.find(e => e.emotion === parsed.data.action);
            if (foundEmotion) {
              setEmotion(foundEmotion);
            } else {
              console.warn("Unknown emotion:", parsed.data.action);
            }
            break;
          }
          case OverlayMessageType.FOLLOW: {
            const followerInfo = parsed.data;
            setFollower({
              name: followerInfo.author,
              pictureURL: followerInfo.pictureURL || "https://test.palitechnika.com/Transgender_Pride_flag.png"
            });

            // Start the animation sequence UwU
            setShowFollow(true);
            // Give it a tiny delay to ensure the enter state is applied first
            setTimeout(() => {
              setFollowAnimation('follow-active');
            }, 50);

            // Start exit animation after 5 seconds >w<
            setTimeout(() => {
              setFollowAnimation('follow-exit');
              // Actually remove the element after animation completes
              setTimeout(() => {
                setShowFollow(false);
                setFollowAnimation('follow-enter'); // Reset for next time
              }, 500);
            }, 5000);
            break;
          }
          default: { // chat
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
      <div className="w-[480px] bg-transparent">
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
              className='flex flex-col overflow-hidden bg-slate-100/65 rounded-b-xl min-h-8'
              ref={containerRef} // Reference to the message container
            >
              {messages.map((message) => (
                <div
                  key={message.id} // Use the unique ID as the key
                  style={{ boxShadow: "0 2px 6px rgba(0, 0, 0, 0.4)" }}
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
                        <span className='' dangerouslySetInnerHTML={{ __html: message.message }} />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

          </div>
          <div className="flex flex-col-reverse h-[32rem] relative overflow-hidden ">
            <div
              className="w-[50rem] h-[50rem] rounded-full absolute z-0 mb-16"
              style={{
                backgroundImage: `radial-gradient(circle, ${emotion.color} 40%, transparent 90%)`,
                clipPath:
                  "polygon(50% 0%, 100% 0%, 100% 50%, 50% 50%)",
                left: "-25rem",
                bottom: "-25rem",
              }}
            ></div>

            {/* bottom bar */}
            <div className="w-[480px] h-[4rem] bg-gradient-to-t from-white/90 to-white/50 z-10 rounded-tr-2xl">
              <div className="flex flex-row max-w-[480px] items-center p-2 gap-2 mt-2 ">
                <IoMusicalNotes className="text-white text-3xl flex-shrink-0 drop-shadow-sims" />
                <div className="overflow-hidden drop-shadow-sims mr-2">
                  <div
                    ref={textRef}
                    className={`text-white text-2xl font-bold whitespace-nowrap w-96
                        ${shouldScroll ? 'scrolling-text' : ''}`}
                  >
                    <span className="px-4">{song}</span>
                    {shouldScroll && <span className="px-4">{song}</span>}
                  </div>
                </div>
                <MdOutlinePhoneIphone className="text-white text-3xl mx-2 flex-shrink-0 drop-shadow-sims" />
              </div>
            </div>

            {/* emotion string */}
            <div className="z-10 origin-top-left -rotate-90 text-white text-4xl uppercase ml-4 -mb-6 drop-shadow-sims"
              style={{ fontFamily: "Metropolis" }}>
              {emotion.emotion}
            </div>

          </div>
        </div>
      </div>

      {/* Call UI is outside of main tower, as to extend on top of right stream view, like in game */}
      {showFollow && (
        <div className={`absolute w-80 h-64 bottom-16 left-[24rem] follow-container ${followAnimation}`}>
          {/* Main container */}
          <div className='flex flex-col w-full h-full p-4'> {/* This is for padding inside */}
            <div className="flex bg-slate-100/80 rounded-xl w-full h-full p-2">
              <div
                className='flex flex-col grow rounded-lg items-center justify-evenly'
                style={{
                  background: 'linear-gradient(to top, #0c3866, #74a2a6, #d4f5cb)',
                  boxShadow: '0 0 12px rgba(0,0,0,0.9), inset 0 0 12px 2px rgba(255,255,255,1)'
                }}>
                {/* Top image with name etc */}
                <div
                  className='flex flex-row justify-evenly items-center gap-2 px-4'
                >
                  <img
                    src={follower.pictureURL}
                    alt=""
                    className="w-24 h-24 rounded-full border-4 drop-shadow-sims border-white"
                  />
                  <div className='flex flex-col'>
                    <span className='font-[Metropolis] font-bold text-[#0c3866] sims'>Nowy follow od:</span>
                    <span className='text-2xl font-bold text-blue-100 drop-shadow-sims uppercase font-[Metropolis]'>{follower.name}</span>
                  </div>
                </div>
                {/* bottom icon */}
                <div
                  className='w-12 h-12 rounded-full flex items-center justify-center text-white'
                  style={{
                    background: `
                    radial-gradient(circle at 30% 30%,
                      rgba(255, 255, 255, 0.8) 0%,
                      rgba(92, 255, 92, 0.9) 20%,
                      rgba(0, 200, 0, 1) 60%,
                      rgba(0, 150, 0, 1) 100%)
                  `,
                    boxShadow: `
                    inset 0px 2px 3px rgba(255, 255, 255, 0.9),
                    inset 0px -2px 3px rgba(0, 0, 0, 0.25),
                    0px 3px 6px rgba(0, 0, 0, 0.4),
                    0px 1px 2px rgba(0, 0, 0, 0.3)
                  `,
                    border: '1px solid rgba(0, 130, 0, 0.6)',
                    position: 'relative',
                  }}
                >
                  <ImPacman className='-rotate-[30deg] text-2xl translate-y-1 translate-x-1' /> <PiWifiMediumBold className='rotate-[80deg] -translate-y-1 text-2xl' />
                </div>
              </div>
            </div>
          </div>
          {/* Arrow */}
          <div className='w-0 h-0 absolute bottom-0 left-12 border-l-[1em] border-l-transparent border-t-[1em] border-r-transparent border-r-[1em] border-t-slate-200/80'></div>
        </div>
      )}

      {/* Right side background */}
      {/* Change to bg-slate-500 or something, by default transaprent */}
      <div className="bg-transparent h-screen aspect-[4/3]"></div>
    </div>
  );
}
