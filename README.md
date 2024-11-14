# Krem Overlays
Overlays I use on my stream and server running them. It's websockets galore.

NOTE: If you're not tech saavy feel free to open an issue. This project kinda assumes you are,
but if you're here just for cool overlays that's cool too and I'm here to help :)

## Deps

* `bun`
* `node` (if you want to control OBS, more on that later)
* `vite`?


## Short intro
This is basically a webapp + server. Overlays are written in React + Vite (+ Tailwind etc.).
Backend is Bun, for fun. With the exception of OBS functionality, because `obs-websocket-js` doesn't
play well with Bun right now.

## How to use
```bash
bun i
```
```bash
bun all
```
Check package.json for exact commands undeneath. Basically bunx, bun and node.

## Features
### Overlays
#### Godot
```
/godot
```
Overlay mimicking the look of Godot's sidebar. Chats and follows come in like Nodes in the tree,
and music is bound to the AudioStreamPlayer at the top. Chats fetch user's twitch chat color (nice).

This uses the Solarized Dark as a theme, as that's what I use. I tried to stick just to Tailwind classes,
so it may be a bit of manual work to tweak the colors, but it's doable.
If you'd like a theme support or something, feel free to open a PR. Or an issue at least.

#### The Sims 4
```
/sims
```
🏗️ Under construction

Chats come in like the notifications in Sims 4. Behind the streamer there's an emotion UI like in Sims.
You can change the emotions via the Deck view. Also I'm working on a VNyan node setup to "detect"
emotions based on facial expressions.

### Stream Deck
```
/deck
```
I don't have cash to spend on a Stream Deck, so I build one in here. It communicates via websockets
with the server and overlays to change a scene, reset avatar position or toggle something in the overlay.

No image support for now, as I struggle to understand the magic of building static sites, but it's on
the roadmap. If you need it faster, create an issue, or better, a PR.

### Integrations
#### Twitch
Done 2 ways: `node-twitch` and `tmi.js`. Second one gets chats, no auth needed. First one gets users colors
and new follows. For colors you just need basic Twitch app with secret and id. For follows you need a User Access Token, for which I haven't built in a seamless integration (I just
generate mine in a separate app and dont even refresh it lol). May do this someday. If you know how,
or think it'd be just neat, open an issue or a PR.

#### OBS
For now `obs-websocket-js` has problems under Bun (see https://github.com/oven-sh/bun/issues/10459).
My workaround? Run this, and only this with Node and communicate via REST. Why not websockets? Less typing.
If you want websockets feel free to open a PR.

*Why don't you just run the whole project with Node? It's not so bad.*
Well I've already written it with Bun in mind.

#### Music
Music assumes you have `playerctl` on your system and are palying music from something that plays nicely
with MPRIS (so, like, basically anything). If you're a Windows dweller... Shoot up an issue and I'll try
to get it done. Or better yet, a PR ;)
