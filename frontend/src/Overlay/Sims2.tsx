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

export default function Sims2() {
  // Messages
  const [messages, setMessages] = useState<ChatMessage[]>([{
    type: OverlayMessageType.CHAT,
    id: -3,
    author: "TestUser1",
    message: "Hello, this is a test message!",
    color: "#FF0000",
    time: "12:00"
  }, {
    type: OverlayMessageType.CHAT,
    id: -2,
    author: "TestUser2",
    message: "Another test message here",
    color: "#00FF00",
    time: "12:01"
  }, {
    type: OverlayMessageType.CHAT,
    id: -1,
    author: "TestUser3",
    message: "And one more test message",
    color: "#0000FF",
    time: "12:02"
  }])
  const [nextId, setNextId] = useState(0); // State to keep track of the next message ID
  const containerRef = useRef<HTMLDivElement>(null); // Reference to the message container

  // Follows
  const [showFollow, setShowFollow] = useState(true);
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
                          <span className='text-2xl font-bold'>X</span>
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
                        className="w-14 h-14 self-end"
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
                        <span className='text-xl break-all'
                          dangerouslySetInnerHTML={{ __html: message.message }} />
                      </div>
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

      {/* <div className="flex flex-row w-full h-full border-[3px] border-[#010E61] rounded-[2rem] bg-[#95A6DE] p-4 gap-4">
        <div className='flex justify-center w-20'>
          <img
            src={
              follower.pictureURL ||
              "https://test.palitechnika.com/Transgender_Pride_flag.png"
            }
            alt=""
            className="w-20 h-20 rounded-xl border-[3px] border-[#010E61]"
          />
        </div>
        <div className='flex flex-col items-start gap-4 text-wrap'>
          <div className="font-[Comic] flex flex-col items-center">
            <span className="text-2xl font-bold">
              {follower.name || "Obserwujący"}
            </span>
          </div>
          <div className="font-[Comic] flex flex-col items-center">
            <span className="text-xl">
              Cześć! Jestem {follower.name || "Obserwujący"}. {followString} asfasf agsgasg asgasgsag asgsag
            </span>
          </div>
        </div>
      </div> */}

      {/* Right side background */}
      {/* Change to bg-slate-500 or something, by default transaprent */}
      <div className="bg-transparent h-screen aspect-[4/3]"></div>
    </div>
  );
}
