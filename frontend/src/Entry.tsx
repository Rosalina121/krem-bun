import React from "react";

export default function Entry() {
  return (
    <>
      <h1>KremStream command center</h1>
      <h2>This is h2 test</h2>
      <h3>This is h3 test</h3>
      <h4>This is h4 test</h4>
      <h5>This is h5 test</h5>

      <div className="flex flex-row gap-4">
        <a href="/look/godot">
          <button className="bg-teal-900 text-white">
            Godot
          </button>
        </a>

        <a href="/look/deck">
          <button className="bg-blue-500 text-white">
            Deck
          </button>
        </a>
      </div>
      
      <a href="/init">
        <button className="bg-red-500 text-white">
          Init Modules
        </button>
      </a>
      <a href="/test">
        <button className="bg-red-500 text-white">
          test ws
        </button>
      </a>


    </>
  )
}
