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

interface ChatMessage {
  type: string,
  id: number,
  author: string,
  message: string,
  color: string,
  exiting?: boolean,
  entering?: boolean,
}

export default function App() {
  // Messages
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [nextId, setNextId] = useState(0); // State to keep track of the next message ID
  const containerRef = useRef<HTMLDivElement>(null); // Reference to the message container

  // 16:9
  const [wide, setWide] = useState(false);

  // Songs
  const [song, setSong] = useState("Nothing playing yet...");

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
          channel: "general-chatroom",
        },
      })
    }
  }, [readyState])

  // Run when a new WebSocket message is received (lastJsonMessage)
  useEffect(() => {
    if (lastMessage) {
      const parsed = JSON.parse(lastMessage.data)
      if (parsed.event === "godot") {
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

  return (
    <div className="flex flex-row overflow-hidden h-screen">
      <div className="flex flex-col w-[480px]  bg-[#062026] p-2">
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
                  {message.type == "chat" ? (
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
                    className={`flex ${message.type === "follow"
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
            {/* Messages */}
            <div className="flex flex-col grow bg-[#0A3B45] p-1">
              <div className="flex text-white flex-col overflow-hidden grow bg-[#06252B] pt-2">
                {/* <div
                  className="font-mono text-xl text-[aliceblue] p-2 flex flex-col"
                  dangerouslySetInnerHTML={{ __html: html }}
                ></div> */}
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
