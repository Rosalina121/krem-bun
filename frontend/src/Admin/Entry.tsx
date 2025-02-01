import React from "react";

export default function Entry() {
  return (
    <div className="flex flex-col gap-4 m-16">
      <h1>KremStream command center</h1>

      <h2>Utils</h2>
      <a href="/admin/deck">
        <button className="bg-blue-500 text-white">
          Deck
        </button>
      </a>

      <h2>Overlays</h2>
      <div className="flex gap-4">
        <a href="/overlay/godot">
          <button className="bg-teal-900 text-white">
            Godot
          </button>
        </a>

        <a href="/overlay/sims">
          <button className="bg-blue-950 text-white">
            Sims
          </button>
        </a>
        
        <a href="/overlay/sims2">
          <button className="bg-green-600 text-white">
            Sims2
          </button>
        </a>

        <a href="/overlay/sims4">
          <button className="bg-blue-400 text-white">
            Sims 4
          </button>
        </a>

      </div>
      
      <h2>Waiting screens</h2>
      <div className="flex gap-4">
        <a href="/wait/sims">
          <button className="bg-blue-950 text-white">
            Sims Wait
          </button>
        </a>
        <a href="/wait/sims2">
          <button className="bg-green-600 text-white">
            Sims 2 Wait
          </button>
        </a>
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
