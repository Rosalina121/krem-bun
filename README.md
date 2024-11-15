# Krem Overlays
Overlays I use on my stream and server running them. It's websockets galore.

NOTE: If you're not tech saavy feel free to open an issue. This project kinda assumes you are,
but if you're here just for cool overlays that's cool too and I'm here to help :)

![Overlay](readme-assets/overlay.png)

## Deps

* `bun`
* `node` (if you want to control OBS, more on that later)
* `vite`?


## Short intro
This is basically a webapp + server. Overlays are written in React + Vite (+ Tailwind etc.).
Backend is Bun, for fun. With the exception of OBS functionality, because `obs-websocket-js` doesn't
play well with Bun right now.

## How to use
Fill in .env with:
```
BACKEND_URL="http://localhost:3000"               # for vite I think?
TWITCH_CLIENT_ID=<your client id here>            # for twitch api
TWITCH_CLIENT_SECRET=<your client secret here>    # same as above
TWITCH_USER_TOKEN=<your twitch user token here>   # only needed for follows
OBS_WS_PASSWORD=<your obs password here>          # for obs if you want to switch scenes or etc.
```
Then
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
![Godot Overlay](readme-assets/godot.gif)

Overlay mimicking the look of Godot's sidebar. Chats and follows come in like Nodes in the tree,
and music is bound to the AudioStreamPlayer at the top. Chats fetch user's twitch chat color (nice).

You can turn off or on the bottom panel (now used for Mario Kart 8 stats and [ravarcheon's string lerp](https://bsky.app/profile/ravarcheon.com/post/3lav6cp7njk2d))
via the `wide` state. It's set up in a way that without it free space is 4:3, with it 16:9.

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
![Deck](readme-assets/deck.png)

I don't have cash to spend on a Stream Deck, so I build one in here. It communicates via websockets
with the server and overlays to change a scene, reset avatar position or toggle something in the overlay.

No image support for now, as I struggle to understand the magic of building static sites, but it's on
the roadmap. If you need it faster, create an issue, or better, a PR.

### Integrations

#### VNyan
🏗️ Under construction

I'm still porting it from my older server. Stay tuned.

Basically websocket communication. For start to reset avatar position. Later on to enable some fun stuff
in overlays.

#### Twitch
**Overview**

Done 2 ways: `node-twitch` and `tmi.js`. Second one gets chats, no auth needed. First one gets users colors
and new follows. For colors you just need basic Twitch app with secret and id. For follows you need a User Access Token, for which I haven't built in a seamless integration (I just
generate mine in a separate app and dont even refresh it lol). May do this someday. If you know how,
or think it'd be just neat, open an issue or a PR.

**Authentication**

I check for an access token in `.token` (don't confuse with User Access Token). If it's not there
we generate a new one and store it there. Same if it's invalid (like expired for example).

For follows you need a User Access Token with `moderator:read:followers` scope. I generate mine with this project: https://github.com/twitchdev/authentication-node-sample/tree/main.
I don't refresh it in any way, so currently it's the only manual part of this setup. I plan on including
it in the initial setup of the server (as I already see some refactoring potential).


#### OBS
For now `obs-websocket-js` has problems under Bun (see https://github.com/oven-sh/bun/issues/10459).
My workaround? Run this, and only this with Node and communicate via REST. Why not websockets? Less typing.
If you want websockets feel free to open a PR.

OBS currently just sets the passed in scene by name.

*Why don't you just run the whole project with Node? It's not so bad.*
Well I've already written it with Bun in mind.

#### Music
Music assumes you have `playerctl` on your system and are palying music from something that plays nicely
with MPRIS (so, like, basically anything). If you're a Windows dweller... Shoot up an issue and I'll try
to get it done. Or better yet, a PR ;)
