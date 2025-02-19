import React, { useEffect, useState, useRef } from 'react';
import useWebSocket, { ReadyState } from "react-use-websocket"

import { emotions, MessageEvent, OverlayMessageType } from '../../../common/types';
import "./Sims.css";
import simsUI from '../assets/images/simstwitch.png'

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

export default function Sims() {
  // Messages
  const [messages, setMessages] = useState<ChatMessage[]>([])
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
            const removeDelayed = setTimeout(() => {
              removeMessage(newMessage.id)
            }, 13000)
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
    if (textRef.current) {
      setShouldScroll(textRef.current.scrollWidth > textRef.current.clientWidth);
    }
  }, [song]);

  // Timeout cleanup
  useEffect(() => {
    return () => {
      if (followTimeoutRef.current) {
        clearTimeout(followTimeoutRef.current);
      }
    };
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
                  key={message.id} // Use the unique ID as the key
                  style={{
                    boxShadow: "inset 6px 0px 4px -1px rgba(0, 0, 0, 0.4), inset 0px -6px 4px -1px rgba(0, 0, 0, 0.6), inset -6px 0px 4px -1px rgba(0, 0, 0, 0.6), inset 0px 6px 4px -1px rgba(255, 255, 255, 0.8)"
                  }}
                  className={`flex flex-col mb-1 p-6 bg-[#121258] transition-all duration-200 ease-in-out ${message.exiting
                    ? "-translate-x-full opacity-100" // Slide out to the left with full opacity
                    : message.entering
                      ? "-translate-x-full" // Fade in from opacity 0
                      : "translate-x-0 opacity-100" // Fully on screen with full opacity
                    }`}
                >
                  <div className="flex flex-row gap-12 justify-evenly p-4">
                    <img
                      src={
                        message.pictureURL ||
                        "https://test.palitechnika.com/Transgender_Pride_flag.png"
                      }
                      alt=""
                      className="w-14 h-14 rounded-md border-2"
                      style={{ boxShadow: "0 0 24px 2px rgba(22, 75, 247, 0.9)" }}
                    />
                    <div className="text-slate-300 font-[Comic] gap-2 flex flex-col items-center w-full">
                      <span className="text-2xl">
                        {message.author}
                      </span>
                      <span className='text-xl break-all' dangerouslySetInnerHTML={{ __html: message.message }} />
                    </div>
                  </div>
                </div>
              ))}
            </div>

          </div>
          <div className="flex flex-col h-[32rem] justify-end overflow-hidden ">
            <img src={simsUI} alt="" />

            {/* bottom bar */}
            <div className="w-[480px] h-[4rem] bg-[#121258]"
              style={{
                boxShadow: "inset 6px 0px 4px -1px rgba(0, 0, 0, 0.4), inset 0px -6px 4px -1px rgba(0, 0, 0, 0.6), inset -6px 0px 4px -1px rgba(0, 0, 0, 0.6), inset 0px 6px 4px -1px rgba(255, 255, 255, 0.8)"
              }}>
              <div className="flex flex-row max-w-[480px] items-center p-2 gap-2 mt-2 ">
                <div className="overflow-hidden font-[Comic]">
                  <div
                    ref={textRef}
                    className={`text-white text-2xl whitespace-nowrap
                        ${shouldScroll ? 'scrolling-text' : ''}`}
                  >
                    <span className="px-4">{song}</span>
                    {shouldScroll && <span className="px-4">{song}</span>}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Call UI is outside of main tower, as to extend on top of right stream view, like in game */}
      {showFollow && (
        <div className="absolute w-[40rem] h-80 bg-[#121258] left-0 right-0 bottom-0 top-0 m-auto"
          style={{
            boxShadow: "inset 6px 0px 4px -1px rgba(0, 0, 0, 0.4), inset 0px -6px 4px -1px rgba(0, 0, 0, 0.6), inset -6px 0px 4px -1px rgba(0, 0, 0, 0.6), inset 0px 6px 4px -1px rgba(255, 255, 255, 0.8)"
          }}>
          <div className="flex flex-col w-full h-full items-center p-8">
            <div className="flex flex-row w-full h-full">
              <div className='flex items-center justify-center grow'>
                <img
                  src={
                    follower.pictureURL ||
                    "https://test.palitechnika.com/Transgender_Pride_flag.png"
                  }
                  alt=""
                  className="w-20 h-20 rounded-md border-2"
                  style={{ boxShadow: "0 0 24px 2px rgba(22, 75, 247, 0.9)" }}
                />
              </div>
              <div className='flex flex-col items-center justify-evenly w-2/3'>
                <div className="text-slate-300 font-[Comic] gap-2 flex flex-col items-center">
                  <span className="text-2xl">
                    {follower.name || "Obserwujący"}
                  </span>
                </div>
                <div className="text-slate-300 font-[Comic] gap-2 flex flex-col items-center">
                  <span className="text-xl">
                    Cześć! Jestem {follower.name || "Obserwujący"}. {followString}
                  </span>
                </div>
              </div>
            </div>
            <button className='!shadow-none absolute primary-button text-nowrap text-2xl'>
              <span className='font-[Comic] translate-y-1 font-normal'>OK</span>
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
