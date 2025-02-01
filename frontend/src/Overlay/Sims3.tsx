import React, { useEffect, useState, useRef } from 'react';
import useWebSocket, { ReadyState } from "react-use-websocket"

import { emotions, MessageEvent, OverlayMessageType } from '../../../common/types';
import "./Sims2.css";
import sims3UI from '../assets/images/sims3ui.png'

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
const DAYS_OF_WEEK = [
  'Nd.',
  'Pon.',
  'Wt.',
  'Śr.',
  'Czw.',
  'Pt.',
  'Sob.'
];

export default function Sims3() {
  // Messages
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      type: OverlayMessageType.CHAT,
      id: 0,
      author: "SimsLover123",
      message: "Anyone know how to get rid of the pool ladder? 😈",
      color: "#000000",
      time: "12:34",
      pictureURL: "https://test.palitechnika.com/Transgender_Pride_flag.png"
    },
    {
      type: OverlayMessageType.CHAT, 
      id: 1,
      author: "PlumbobFan",
      message: "Sul sul! Just got my Sim a new job!",
      color: "#000000",
      time: "12:35",
      pictureURL: "https://test.palitechnika.com/Transgender_Pride_flag.png"
    },
    {
      type: OverlayMessageType.CHAT,
      id: 2,
      author: "RosamundLover",
      message: "My sim just got married! 💕",
      color: "#000000", 
      time: "12:36",
      pictureURL: "https://test.palitechnika.com/Transgender_Pride_flag.png"
    }
  ])
  const [nextId, setNextId] = useState(0); // State to keep track of the next message ID
  const containerRef = useRef<HTMLDivElement>(null); // Reference to the message container

  // Follows
  const [showFollow, setShowFollow] = useState(false);
  const [follower, setFollower] = useState({ name: '', pictureURL: '' });
  const [followString, setFollowString] = useState("")
  const followTimeoutRef = useRef<ReturnType<typeof setTimeout>>();
  const followStrings: string[] = [
    "Od teraz Cię obserwuję. Każdy. Twój. Ruch.",
    "Mogę pożyczyć łyżeczkę cukru?",
    "Nie widziałaś może mojej drabinki do basenu?"
  ]

  // Time
  const [currentTime, setCurrentTime] = useState('');


  // Songs
  const [song, setSong] = useState("Nothing playing yet... But longer now, to test the scroll.");
  const [shouldScroll, setShouldScroll] = useState(false);
  const textRef = useRef<HTMLDivElement>(null);

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
          case OverlayMessageType.MUSIC: {
            if (!parsed.data.title && !parsed.data.album && !parsed.data.artist) {
              setSong("Awaiting some tunes...")
            } else {
              setSong(`${parsed.data.title} ${parsed.data?.album && "from " + parsed.data.album} ${parsed.data?.artist && "by " + parsed.data.artist}`)
            }
            break;
          }
          case OverlayMessageType.ACTION: {
            console.log("Action received:", parsed.data.action)
            const foundEmotion = emotions.find((e: { emotion: string }) => e.emotion === parsed.data.action);
            if (foundEmotion) {
              // Removed setEmotion since it wasn't defined
              console.log("Found emotion:", foundEmotion);
            } else {
              console.warn("Unknown emotion:", parsed.data.action);
            }
            break;
          }
          case OverlayMessageType.FOLLOW: {
            if (followTimeoutRef.current) {
              clearTimeout(followTimeoutRef.current);
            }

            setFollower({
              name: parsed.data.author,
              pictureURL: parsed.data.pictureURL || "https://test.palitechnika.com/Transgender_Pride_flag.png"
            });
            setFollowString(followStrings[Math.floor(Math.random() * followStrings.length)])
            setShowFollow(true);

            followTimeoutRef.current = setTimeout(() => {
              setShowFollow(false);
              followTimeoutRef.current = undefined;
            }, 7000);
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

  // Scroll song
  useEffect(() => {
    const checkScroll = () => {
      if (textRef.current) {
        const isOverflowing = textRef.current.scrollWidth > (textRef.current.parentElement?.clientWidth || 0);
        setShouldScroll(isOverflowing);
        console.log('Scroll check:', {
          scrollWidth: textRef.current.scrollWidth,
          parentWidth: textRef.current.parentElement?.clientWidth,
          shouldScroll: isOverflowing
        });
      }
    };

    checkScroll();
    // Optional: Add window resize listener
    window.addEventListener('resize', checkScroll);
    return () => window.removeEventListener('resize', checkScroll);
  }, [song]);

  // Timeout cleanup
  useEffect(() => {
    return () => {
      if (followTimeoutRef.current) {
        clearTimeout(followTimeoutRef.current);
      }
    };
  }, []);

  // Time
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const dayOfWeek = DAYS_OF_WEEK[now.getDay()];
      const hours = String(now.getHours()).padStart(2, '0');
      const minutes = String(now.getMinutes()).padStart(2, '0');
      setCurrentTime(`${dayOfWeek} ${hours}:${minutes}`);
    };

    updateTime(); // Initial update
    const interval = setInterval(updateTime, 1000); // Update every second

    return () => clearInterval(interval); // Cleanup on unmount
  }, []);

  return (
    <div className="flex flex-row overflow-hidden">
      <div className="w-[480px] bg-transparent">
        <div className="flex flex-col h-full">
          {/* Messages Container */}
          <div
            className="flex flex-col h-[568px] overflow-hidden"
          >
            <div
              className='flex flex-col overflow-hidden min-h-8 p-1'
              ref={containerRef} // Reference to the message container
            >
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex flex-col mb-1 transition-all relative duration-200 ease-in-out ${message.exiting
                    ? "-translate-x-full opacity-100"
                    : message.entering
                      ? "-translate-x-full"
                      : "translate-x-0 opacity-100"
                    }`}
                >
                  {/* Container with relative positioning */}
                  <div className="relative"> {/* Added padding-bottom to accommodate background */}
                    {/* Background - positioned absolute */}
                    <div className='absolute inset-0 flex flex-row items-end'
                      style={{ filter: "drop-shadow(2px 2px 2px #000000dd)" }}>
                      <div className='grow h-8 bg-[#5870B1dd] rounded-l-xl border-l-2 border-y-2 border-[#010E61]'>
                      </div>
                      <div className='flex flex-col w-10'>
                        <div className='flex items-center justify-center h-8 bg-[#5870B1dd] rounded-t-xl border-x-2 border-t-2 border-[#010E61]'>
                          {/* Container for the cross */}
                          <div className="relative w-4 h-4 rotate-45"
                            style={{
                              filter: ` drop-shadow(0px 0px 1px #010E61)
                                              drop-shadow(0px 0px 1px #010E61)
                                              drop-shadow(0px 0px 1px #010E61)
                                              drop-shadow(0px 0px 1px #010E61)`
                            }}
                          >
                            {/* Horizontal line */}
                            <div className="absolute top-1/2 left-0 w-full h-[4px] bg-[#C7D7E4] rounded-full
                              transform -translate-y-1/2"></div>
                            {/* Vertical line */}
                            <div className="absolute left-1/2 top-0 h-full w-[4px] bg-[#C7D7E4] rounded-full
                              transform -translate-x-1/2"></div>
                          </div>
                        </div>
                        <div className='h-8 bg-[#5870B1dd] rounded-br-xl border-b-2 border-r-2 border-[#010E61]'>
                        </div>
                      </div>
                    </div>

                    {/* Content - positioned relative */}
                    <div className="relative z-10 flex flex-row p-4 gap-2">
                      <img
                        src={message.pictureURL || "https://test.palitechnika.com/Transgender_Pride_flag.png"}
                        alt=""
                        className="w-14 h-14 self-end rounded-lg"
                        style={{ boxShadow: "0px 0px 7px #000000dd" }}
                      />
                      <div className="text-[#010E61] font-[Comic] w-4/5 bg-[#C7D7E4] rounded-xl border-2 border-[#010E61] p-2 relative"
                        style={{ boxShadow: "2px 2px 6px #000000dd" }}

                      >
                        {/* Speech bubble tail */}
                        <div className="absolute -left-[15px] bottom-3 w-0 h-0
                          border-t-[10px] border-t-transparent
                          border-r-[16px] border-r-[#C7D7E4]
                          border-b-[10px] border-b-transparent
                          z-10" />
                        {/* Border for the tail */}
                        <div className="absolute -left-[18px] bottom-3 w-0 h-0
                          border-t-[10px] border-t-transparent
                          border-r-[16px] border-r-black
                          border-b-[10px] border-b-transparent
                          z-0" />

                        <span className="text-xl font-bold">
                          {message.author}:{" "}
                        </span>
                        <span className='text-xl break-words'
                          dangerouslySetInnerHTML={{ __html: message.message }} />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

          </div>
          
          {/* hud bg */}
          <img className="absolute bottom-0 w-[1286px] h-[352px]" style={{ imageRendering: "pixelated" }} src={sims3UI} alt="" />
          {/* scroll */}
          <div className='flex items-center absolute w-[9.5rem] text-[#22273F] bottom-[2rem] left-[10.5rem] text-xl font-semibold overflow-hidden'>
            <div
              ref={textRef}
              className={`whitespace-nowrap
                ${shouldScroll ? 'scrolling-text' : ''}`}
            >
              <span className="px-4">{song}</span>
              {shouldScroll && <span className="px-4">{song}</span>}
            </div>
          </div>
          {/* time */}
          <div className='flex items-center justify-center absolute w-44 text-[#22273F] font-semibold bottom-[4.825rem] left-[40.5rem] text-xl'>
            <span className=''>{currentTime}</span>
          </div>
          {/* moodlets */}
          <div className='absolute w-[17rem] h-[14.5rem] bottom-12 left-[57rem] grid-cols-3 grid-rows-2 grid p-2 gap-2'>
            <div className='flex flex-col items-center'>
              {/* example blue */}
              <div className='aspect-square bg-gradient-to-t from-blue-300 to-blue-100 w-full rounded-lg border-4 border-blue-900/80'
                style={{boxShadow: "inset 0 0 4px #1e3a8a"}}
              ></div>
              <span className='text-[#22273F] font-semibold'>2 h</span>
            </div>
            {/* example green */}
            <div className='flex flex-col items-center'>
              <div className='aspect-square bg-gradient-to-t from-green-300 to-green-100 w-full rounded-lg border-4 border-green-900/80'
                style={{boxShadow: "inset 0 0 4px #14532d"}}
              ></div>
              <span className='text-[#22273F] font-semibold'>7 h</span>
            </div>
            {/* example red */}
            <div className='flex flex-col items-center'>
              <div className='aspect-square bg-gradient-to-t from-red-300 to-red-100 w-full rounded-lg border-4 border-red-900/80'
                style={{boxShadow: "inset 0 0 4px #7f1d1d"}}
              ></div>
              <span className='text-[#22273F] font-semibold'>-</span>
            </div>
            {/* exampl yellow */}
            <div className='flex flex-col items-center'>
              <div className='aspect-square bg-gradient-to-t from-yellow-300 to-yellow-100 w-full rounded-lg border-4 border-yellow-900/80'
                style={{boxShadow: "inset 0 0 4px #713f12"}}
              ></div>
              <span className='text-[#22273F] font-semibold'>2 h</span>
            </div>
          </div>
        </div>
      </div>

      {/* Call UI is outside of main tower, as to extend on top of right stream view, like in game */}
      {showFollow && (
        <div className="absolute text-[#010E61] max-w-96 bg-[#5870B1dd] p-4 rounded-[3rem] border-4 border-[#010E61] left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
          style={{ boxShadow: "2px 2px 6px #000000dd" }}
        >
          <div className='flex flex-col w-full h-full gap-2 items-center'>
            <div className="flex flex-row bg-[#95A6DEdd] border-[3px] border-[#010E61] rounded-[2rem] gap-4 p-4">
              <img
                src={
                  follower.pictureURL ||
                  "https://test.palitechnika.com/Transgender_Pride_flag.png"
                }
                alt=""
                className="w-20 h-20 rounded-xl border-[3px] border-[#010E61]"
              />
              <div className='flex flex-col items-start gap-4 text-wrap'>
                <div className="font-[Comic] flex flex-col items-center">
                  <span className="text-2xl font-bold">
                    {follower.name || "Obserwujący"}
                  </span>
                </div>
                <div className="font-[Comic] flex flex-col items-center">
                  <span className="text-xl">
                    Cześć! Jestem {follower.name || "Obserwujący"}. {followString}
                  </span>
                </div>
              </div>
            </div>
            <button className='!sr-onlyshadow-none bg-[#95A6DE] border-[3px] border-[#010E61] text-nowrap text-2xl font-[Comic] w-32'>
              <span className='font-normal'>OK</span>
            </button>
          </div>
        </div>
      )}

      {/* Right side background */}
      {/* Change to bg-slate-500 or something, by default transaprent */}
      <div className="bg-transparent h-screen aspect-[4/3]"></div>
    </div>
  );
}
