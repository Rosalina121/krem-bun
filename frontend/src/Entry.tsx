import React from "react";

export default function Entry() {
  return (
    <div className="flex flex-col gap-4 m-16">
      <h1>KremStream command center</h1>

      <h2>Utils</h2>
      <a href="/look/deck">
        <button className="bg-blue-500 text-white">
          Deck
        </button>
      </a>

      <h2>Overlays</h2>
      <div className="flex">
        <div className="flex gap-4">
          <a href="/look/godot">
            <button className="bg-teal-900 text-white">
              Godot
            </button>
          </a>

          <a href="/look/sims">
            <button className="bg-blue-950 text-white">
              Sims
            </button>
          </a>

          <a href="/look/sims4">
            <button className="bg-blue-400 text-white">
              Sims 4
            </button>
          </a>

        </div>
      </div>

      <h2>Actions</h2>

      <div className="flex gap-4">
        <button
          className="bg-red-500 text-white"
          onClick={() => fetch('/init')}
        >
          Init modules
        </button>
        <button
          className="bg-rose-500 text-white"
          onClick={() => fetch('/test/chat')}
        >
          Test chat message
        </button>
        <button
          className="bg-rose-500 text-white"
          onClick={() => fetch('/test/follow')}
        >
          Test new follow
        </button>
      </div>



    </div>
  )
}
