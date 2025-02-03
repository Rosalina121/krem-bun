import React, { useEffect, useState, useRef } from 'react';
import useWebSocket, { ReadyState } from "react-use-websocket"

import { MessageEvent, OverlayMessageType } from '../../../common/types';
import "./Switch.css";
import { AiFillPlusCircle } from 'react-icons/ai';
import { RiBlueskyLine, RiSoundcloudLine } from 'react-icons/ri';
import { FiGithub } from 'react-icons/fi';
import { FaHeart } from 'react-icons/fa6';
import { IoMdTransgender } from 'react-icons/io';

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

interface IconConfig {
  id: number;
  icon: JSX.Element;
  link: string;
  color?: string;
}

const iconConfigs: IconConfig[] = [
  {
    id: 1,
    icon: <RiBlueskyLine className='absolute translate-y-[1px] text-blue-500 text-6xl' />,
    link: "bsky.com/dupa.gay"
  },
  {
    id: 2,
    icon: <RiSoundcloudLine className='absolute text-orange-400 text-5xl' />,
    link: "soundcloud.com/rosalina121"
  },
  {
    id: 3,
    icon: <FiGithub className='absolute text-white text-5xl translate-y-1' />,
    link: "github.com/Rosalina121"
  },
  {
    id: 4,
    icon: <IoMdTransgender className='absolute text-pink-400 text-5xl translate-y-1' />,
    link: "Human Rights"
  },
];

export default function Switch() {
  // Wide
  const [wide, setWide] = useState(true);

  // Switch icons
  const [chosenIcon, setChosenIcon] = useState(0)

  // Messages
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [nextId, setNextId] = useState(0); // State to keep track of the next message ID
  const containerRef = useRef<HTMLDivElement>(null); // Reference to the message container

  // Follows
  const [showFollow, setShowFollow] = useState(false);
  const [follower, setFollower] = useState({ name: '', pictureURL: '' });
  const followTimeoutRef = useRef<ReturnType<typeof setTimeout>>();

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
            switch (parsed.data.action) {
              case "Aspect":
                setWide(!wide);
                break;
              // Left or Right cursor
              case "Left":
                setChosenIcon(Math.max(chosenIcon - 1, 0));
                break;
              case "Right":
                setChosenIcon(Math.min(chosenIcon + 1, iconConfigs.length));
                break;
              default:
                console.warn("Unknown action:", parsed.data.action)
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
            setShowFollow(true);

            followTimeoutRef.current = setTimeout(() => {
              setShowFollow(false);
              followTimeoutRef.current = undefined;
            }, 7000);
            break;
          }
          default: { // chat
            const newChatMessage = parsed.data

            // Check message content against all icon keywords
            // Parsing messages here instead of the server since it's overlay specific
            // And actions are basically for things that you click on i.e. Deck, so emotions in Sims4, MK stats in Godot etc.
            if (newChatMessage.message.toLowerCase().includes("!r")) {
              setChosenIcon(Math.min(chosenIcon + 1, iconConfigs.length));
            } else if (newChatMessage.message.toLowerCase().includes("!l")) {
              setChosenIcon(Math.max(chosenIcon - 1, 0));
            }


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
          }
        }
      }
    }

    removeOverflowingMessages(); // Check for overflow whenever messages change
  }, [messages]); // Trigger this effect whenever the messages array changes

  // Scroll song
  useEffect(() => {
    if (textRef.current) {
      setShouldScroll(textRef.current.scrollWidth > textRef.current.clientWidth);
    }
  }, [song]);

  // Follow timeout cleanup
  useEffect(() => {
    return () => {
      if (followTimeoutRef.current) {
        clearTimeout(followTimeoutRef.current);
      }
    };
  }, []);

  // Icon timeout
  // useEffect(() => {
  //   // Clear any existing timeout when chosenIcon changes
  //   if (iconTimeoutRef.current) {
  //     clearTimeout(iconTimeoutRef.current);
  //   }

  //   // Only set a new timeout if an icon is selected (not 99)
  //   if (chosenIcon !== 99) {
  //     iconTimeoutRef.current = setTimeout(() => {
  //       setChosenIcon(99);
  //       iconTimeoutRef.current = undefined;
  //     }, 20000); // 20 seconds
  //   }

  //   // Cleanup on unmount
  //   return () => {
  //     if (iconTimeoutRef.current) {
  //       clearTimeout(iconTimeoutRef.current);
  //     }
  //   };
  // }, [chosenIcon]); // Run effect when chosenIcon changes

  return (
    <div className="flex flex-row overflow-hidden">
      <div className="w-[480px]">
        <div className="flex flex-col h-full">
          {/* Messages Container */}
          <div
            className="flex flex-col h-[568px] overflow-hidden bg-[#393330]"
          >
            <div className='flex flex-row w-[90%] border-b-[1px] border-gray-500 self-center mt-6 pb-1 items-center text-white text-xl gap-2'>
              <div className='w-2 bg-white h-5'>
              </div>
              Chat Activity
            </div>
            <div
              className='flex flex-col overflow-hidden min-h-8 p-1 items-center'
              ref={containerRef} // Reference to the message container
            >
              {messages.map((message) => (
                <div
                  key={message.id} // Use the unique ID as the key
                  className={`flex flex-col w-[90%] mb-1 border-b-[1px] border-gray-500 transition-all duration-200 ease-in-out ${message.exiting
                    ? "-translate-x-full opacity-100" // Slide out to the left with full opacity
                    : message.entering
                      ? "-translate-x-full" // Fade in from opacity 0
                      : "translate-x-0 opacity-100" // Fully on screen with full opacity
                    }`}
                >
                  <div className="flex flex-row justify-start items-start p-4 gap-2">
                    <img
                      src={
                        message.pictureURL ||
                        "https://test.palitechnika.com/Transgender_Pride_flag.png"
                      }
                      alt=""
                      className="w-14 h-14"
                    />
                    <div className="text-slate-300 flex flex-col w-full">
                      <span className="text-2xl">
                        {message.author}
                      </span>
                      <span className='text-xl text-teal-500 break-words' dangerouslySetInnerHTML={{ __html: message.message }} />
                    </div>
                  </div>
                </div>
              ))}
            </div>

          </div>
          {/* spacer bar */}
          <div className="w-[90%] h-[1px] bg-white self-center"></div>
          <div className="flex flex-col h-[512px] justify-end overflow-hidden ">
            {/* scroll bar */}
            <div className="w-[480px] grow flex items-center bg-[#393330]">
              <div className="flex flex-row max-w-[480px] items-center p-2 gap-2">
                {/* cart icon */}
                <div className='h-6 w-5 flex-shrink-0 bg-[#38bdf8] flex flex-row justify-center'>
                  <div className='relative top-4 w-0 h-0 border-l-[5px] border-l-transparent border-r-[5px] border-r-transparent border-t-[5px] border-[#393330]'></div>
                </div>
                <div className="overflow-hidden text-[#38bdf8]">
                  <div
                    ref={textRef}
                    className={` text-2xl whitespace-nowrap
                        ${shouldScroll ? 'scrolling-text' : ''}`}
                  >
                    <span className="px-8">{song}</span>
                    {shouldScroll && <span className="px-8">{song}</span>}
                  </div>
                </div>
              </div>
            </div>

            {/* "Game icon" */}
            <div className='flex flex-row'>
              <div className='w-14 bg-[#393330]'></div>
                <div className='grow aspect-square outline-offset-[8px] rounded-[1px] z-10 '
                  style={{
                    boxShadow: "0px 0px 10px black",
                    outline: chosenIcon === 0 ? "6px solid #38bdf8" : "4px solid transparent",
                    animation: chosenIcon === 0 ? 'iconPulse 1s ease-in-out infinite' : 'none'
                  }}>
                </div>
                <div className='w-14 bg-[#393330]'></div>

            </div>
            
            <div className='h-14 w-full bg-[#393330]'></div>
          </div>
        </div>
      </div>

      {/* Call UI is outside of main tower, as to extend on top of right stream view, like in game */}
      {showFollow && (
        <>
          {/* Blurred backdrop */}
          <div
            className="fixed z-10 inset-0"
            style={{
              backgroundColor: 'rgba(0, 0, 0, 0.3)',
              backdropFilter: 'blur(8px)',
            }}
          />

          {/* Modal content */}
          <div className="absolute w-[40rem] h-80 bg-[#393330]/85 left-0 right-0 bottom-0 top-0 m-auto flex flex-col items-center justify-between z-10">
            <div className='flex flex-col items-center justify-around px-12 pt-8 gap-5'>
              <div className='self-start text-white/70'>Error Code: 2137-6969</div>
              <div className='text-white text-xl px-8 flex flex-col gap-2'>
                <p>A follower has occured.</p>
                <p>
                  <span className='font-bold text-teal-500'>{follower.name || "Obserwujący"}</span>{" "}
                  has started following you. If the follower persists, please refer
                  to the Kremówka Support website.<br />
                  https://dupa.gay
                </p>
              </div>
            </div>

            <div
              className='w-full h-14 bg-[#191615]/85 flex items-center text-2xl justify-center rounded text-white outline outline-4 outline-sky-400'
              style={{ animation: "iconPulse 1s ease-in-out infinite" }}
            >
              OK
            </div>
          </div>
        </>
      )}

      {/* Right side background */}
      {/* Change to bg-slate-500 or something, by default transaprent */}
      {/* <div className="bg-transparent h-screen aspect-[4/3]"></div> */}

      {/* Set to false for 4:3 */}
      {wide && (
        <div className="flex w-[1440px] flex-col">
          {/* it's just here for padding nad debug */}
          <div className="bg-red-500 opacity-0 aspect-[16/9]"></div>
          <div className="bg-[#393330] px-4 h-[270px] flex flex-col">
            {/* icon container */}
            <div className='w-full flex flex-row items-center justify-center grow gap-6'>
              {iconConfigs.map((config) => (
                <div
                  key={config.id}
                  className='bg-[#5B5453] w-20 h-20 rounded-full flex items-center justify-center'
                  style={{
                    boxShadow: "0px 0px 5px black",
                    outline: chosenIcon === config.id ? "4px solid #38bdf8" : "4px solid transparent",
                    animation: chosenIcon === config.id ? 'iconPulse 1s ease-in-out infinite' : 'none'
                  }}
                >
                  {config.icon}
                  <div
                    className="relative -bottom-[4rem] text-nowrap text-2xl text-[#38bdf8]"
                    style={{
                      opacity: chosenIcon === config.id ? 1 : 0,
                      transition: 'opacity 0.3s'
                    }}
                  >
                    {config.link}
                  </div>
                </div>
              ))}
            </div>

            {/* bottom footer */}
            <div className='border-t-[1px] border-white w-full flex flex-rox text-white items-center justify-end gap-10 text-xl px-4 py-3'>
              <div className='flex flex-row items-center gap-1 justify-evenly'>
                <FaHeart className='translate-y-0.5' />
                Follow
              </div>
              {/* <div className='flex flex-row items-center gap-1 justify-evenly'>
                <AiFillPlusCircle className='translate-y-0.5' />
                Options
              </div> */}
              <div className='flex flex-row items-center gap-1 justify-evenly'>
                <div className='bg-white text-[#393330] rounded-full px-2 py-1 text-sm font-bold'>!L</div>
                {"/"}
                <div className='bg-white text-[#393330] rounded-full px-2 py-1 text-sm font-bold'>!R</div>
                <span className='ml-1'>Move cursor</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
