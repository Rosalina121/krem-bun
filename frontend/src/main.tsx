import "./index.css";

import React from "react";
import ReactDOM from "react-dom/client";
import {
  createBrowserRouter,
  RouterProvider,
} from "react-router-dom";

import Entry from "./Admin/Entry";
import Deck from "./Admin/Deck";

import Godot from "./Overlay/Godot";
import Sims4 from "./Overlay/Sims4";
import Sims from "./Overlay/Sims";
import SimsWaiting from "./Waiting/SimsWaiting";
import Sims2Waiting from "./Waiting/Sims2Waiting";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Entry />,
  },
  {
    path: "/overlay/godot",
    element: <Godot />
  },
  {
    path: "/overlay/sims",
    element: <Sims />
  },
  {
    path: "/overlay/sims4",
    element: <Sims4 />
  },
  {
    path: "/admin/deck",
    element: <Deck />
  },
  {
    path: "/wait/sims",
    element: <SimsWaiting />
  },
  {
    path: "/wait/sims2",
    element: <Sims2Waiting />
  }
]);

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);
