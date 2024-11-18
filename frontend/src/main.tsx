import "./index.css";

import React from "react";
import ReactDOM from "react-dom/client";
import {
  createBrowserRouter,
  RouterProvider,
} from "react-router-dom";

import Entry from "./Entry";
import Godot from "./Godot";
import Deck from "./Deck";
import Sims4 from "./Sims4";
import Sims from "./Sims";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Entry />,
  },
  {
    path: "/look/godot",
    element: <Godot />
  },
  {
    path: "/look/sims",
    element: <Sims />
  },
  {
    path: "/look/sims4",
    element: <Sims4 />
  },
  {
    path: "/look/deck",
    element: <Deck />
  }
]);

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);
