import { TwitchApi } from "node-twitch";
import * as tmi from "tmi.js";
const emoteParser = require('tmi-emote-parse') 
import { OverlayMessageType, OverlayTwitchMessage, MessageEvent, ClientWebSocket } from "../../common/types";
import { existsSync } from 'fs';

let accessToken: string;
let twitch: TwitchApi;
let chatSocket: tmi.Client;
let followSocket: any;    // event socket tbh, but follow for now

const COLOR_CACHE_FILE = './.color-cache.json';
const PROFILE_CACHE_FILE = './.profile-cache.json';
const CACHE_DURATION = 30 * 24 * 60 * 60 * 1000; // 30 days in milliseconds

interface ColorCache {
    colors: {
        [username: string]: {
            color: string;
            timestamp: number;
        };
    };
}
let colorCache: ColorCache = { colors: {} };

interface ProfileCache {
    profiles: {
        [username: string]: {
            pictureUrl: string;
            timestamp: number;
        };
    };
}
let profileCache: ProfileCache = { profiles: {} };

async function loadColorCache() {
    try {
        if (existsSync(COLOR_CACHE_FILE)) {
            const cacheFile = await Bun.file(COLOR_CACHE_FILE).json();
            colorCache = cacheFile;

            // Clean old entries
            const now = Date.now();
            let hasChanges = false;

            Object.keys(colorCache.colors).forEach(username => {
                if (now - colorCache.colors[username].timestamp > CACHE_DURATION) {
                    delete colorCache.colors[username];
                    hasChanges = true;
                }
            });

            if (hasChanges) {
                await saveColorCache();
            }
        }
    } catch (error) {
        console.error('Error loading color cache:', error);
        colorCache = { colors: {} };
    }
}

async function saveColorCache() {
    try {
        await Bun.write(COLOR_CACHE_FILE, JSON.stringify(colorCache, null, 2));
    } catch (error) {
        console.error('Error saving color cache:', error);
    }
}

async function getUserColor(username: string) {
    // Check cache first
    if (colorCache.colors[username]) {
        const cached = colorCache.colors[username];
        const now = Date.now();

        // If cache is still valid, return the cached color
        if (now - cached.timestamp <= CACHE_DURATION) {
            return cached.color;
        }

        // If cache is expired, delete it
        delete colorCache.colors[username];
        await saveColorCache();
    }

    // If not in cache or expired, fetch from API
    try {
        const users = await twitch.getUsers(username);
        const response = await fetch(
            `https://api.twitch.tv/helix/chat/color?user_id=${users.data[0].id}`,
            {
                headers: {
                    "Client-ID": process.env.TWITCH_CLIENT_ID || "",
                    Authorization: `Bearer ${accessToken || ""}`,
                },
            }
        );
        const data = await response.json();
        const color = data.data[0].color;

        // Cache the result
        colorCache.colors[username] = {
            color,
            timestamp: Date.now()
        };
        await saveColorCache();

        return color;
    } catch (error) {
        console.error('Error fetching user color:', error);
        return "#FF6395"; // Default color
    }
}

// Add new loading function
async function loadProfileCache() {
    try {
        if (existsSync(PROFILE_CACHE_FILE)) {
            const cacheFile = await Bun.file(PROFILE_CACHE_FILE).json();
            profileCache = cacheFile;

            // Clean old entries
            const now = Date.now();
            let hasChanges = false;

            Object.keys(profileCache.profiles).forEach(username => {
                if (now - profileCache.profiles[username].timestamp > CACHE_DURATION) {
                    delete profileCache.profiles[username];
                    hasChanges = true;
                }
            });

            if (hasChanges) {
                await saveProfileCache();
            }
        }
    } catch (error) {
        console.error('Error loading profile cache:', error);
        profileCache = { profiles: {} };
    }
}

// Add new saving function
async function saveProfileCache() {
    try {
        await Bun.write(PROFILE_CACHE_FILE, JSON.stringify(profileCache, null, 2));
    } catch (error) {
        console.error('Error saving profile cache:', error);
    }
}

// Add new function to get profile picture
async function getUserProfilePicture(username: string): Promise<string> {
    // Check cache first
    if (profileCache.profiles[username]) {
        const cached = profileCache.profiles[username];
        const now = Date.now();

        // If cache is still valid, return the cached URL
        if (now - cached.timestamp <= CACHE_DURATION) {
            return cached.pictureUrl;
        }

        // If cache is expired, delete it
        delete profileCache.profiles[username];
        await saveProfileCache();
    }

    // If not in cache or expired, fetch from API
    try {
        const users = await twitch.getUsers(username);
        const pictureUrl = users.data[0].profile_image_url;

        // Cache the result
        profileCache.profiles[username] = {
            pictureUrl,
            timestamp: Date.now()
        };
        await saveProfileCache();

        return pictureUrl;
    } catch (error) {
        console.error('Error fetching user profile picture:', error);
        return ""; // Return empty string on error
    }
}

export async function initTwitch(clients: ClientWebSocket[]) {
    // Load the color cache when initializing
    await loadColorCache();
    await loadProfileCache()

    twitch = new TwitchApi({
        client_id: process.env.TWITCH_CLIENT_ID || "",
        client_secret: process.env.TWITCH_CLIENT_SECRET || "",
    });

    accessToken = await getAccessToken()

    chatSocket = new tmi.client({
        channels: ["kremstream"],
    });
    chatSocket.connect()
    
    emoteParser.setDebug(true)
    emoteParser.events.on("error", e => {
        console.log("Emote error", e)
    })
    emoteParser.setTwitchCredentials(process.env.TWITCH_CLIENT_ID, accessToken)
    emoteParser.loadAssets("kremstream", "twitch", "twitchdev")
    
    chatSocket.on("message", (channel: any, tags: any, message: any, _self: any) => handleChatMessage(channel, tags, message, clients))

    followSocket = new WebSocket("wss://eventsub.wss.twitch.tv/ws");
    followSocket.onopen = () => console.log("Connected to follow socket");
    followSocket.onerror = (error: any) => console.error("TwitchWebSocket error:", error);
    followSocket.onmessage = (data: any) => handleFollow(data.data, clients);
}

async function getAccessToken() {
    let twitchAccessToken;
    try {
        twitchAccessToken = await Bun.file("./.token").text();
    } catch {
        twitchAccessToken = null;
    }
    if (twitchAccessToken) {
        const response = await fetch("https://id.twitch.tv/oauth2/validate", {
            headers: {
                Authorization: `Bearer ${twitchAccessToken}`,
            },
        });
        if (response.status === 200) {
            console.log("Token is valid");
        } else {
            console.log("Token is invalid, generating a new one...");
            twitchAccessToken = null;
        }
    }

    if (!twitchAccessToken) {
        console.log("Requesting new token...")
        const response = await fetch("https://id.twitch.tv/oauth2/token", {
            method: "POST",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
            },
            body: `client_id=${process.env.TWITCH_CLIENT_ID}&client_secret=${process.env.TWITCH_CLIENT_SECRET}&grant_type=client_credentials`,
        });
        const data = await response.json();
        console.log("Expires in:", data.expires_in);
        twitchAccessToken = data.access_token;
        await Bun.write("./.token", data.access_token);
    }
    return twitchAccessToken;
}

async function handleChatMessage(channel: any, tags: any, message: any, clients: ClientWebSocket[]) {
    // TODO: store colors per sesssion. Not many viewers now so no need for lol
    const [userColor, userPicture] = await Promise.all([
        getUserColor(tags.username),
        getUserProfilePicture(tags.username)
    ]);
    
    const parsedWithEmotes = emoteParser.replaceEmotes(message, tags, channel, self);
    
    // Send to the first connected client
    const tmpMessage: OverlayTwitchMessage = {
        event: MessageEvent.OVERLAY,
        type: OverlayMessageType.CHAT,
        data: {
            author: tags.username,
            message: parsedWithEmotes,
            color: userColor || "#FF6395",
            pictureURL: userPicture // Add this line
        }
    }
    clients.forEach((client) => {
        client.send(tmpMessage);
    })

    console.log(
        `[${new Date().toJSON()}] ${tags.username}: ${message}. Color: ${userColor}`
    );
}

async function handleFollow(data: any, clients: ClientWebSocket[]) {
    const json = JSON.parse(data);
    const messageType = json?.metadata?.message_type
    switch (messageType) {
        case "session_welcome":
            // console.log("debug", process.env.TWITCH_USER_TOKEN)
            fetch(
                "https://api.twitch.tv/helix/eventsub/subscriptions",
                {
                    method: "post",
                    headers: {
                        "Client-ID": process.env.TWITCH_CLIENT_ID || '',
                        Authorization: `Bearer ${process.env.TWITCH_USER_TOKEN}`,
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        type: "channel.follow",
                        version: "2",
                        condition: {
                            broadcaster_user_id: "675296114",
                            moderator_user_id: "675296114",
                        },
                        transport: {
                            method: "websocket",
                            session_id: json.payload.session.id,
                        },
                    }),
                }
            )
                .then((res) => res.json())
                .then((data) => console.log("Follower socket status:", data))
                .catch((err) => console.log(err));
            break;
        case "notification":
            if (json.payload.subscription.type === "channel.follow") {
                console.log("New follower: ", json.payload.event.user_name);
                const [userColor, userPicture] = await Promise.all([
                    getUserColor(json.payload.event.user_name),
                    getUserProfilePicture(json.payload.event.user_name)
                ]);

                const tmpMessage: OverlayTwitchMessage = {
                    event: MessageEvent.OVERLAY,
                    type: OverlayMessageType.FOLLOW,
                    data: {
                        author: json.payload.event.user_name,
                        message: "PathFollow3D",
                        color: userColor || "#FF6395",
                        pictureURL: userPicture
                    }
                }
                clients.forEach((client) => {
                    client.send(tmpMessage);
                })
            }
            break;
        case "session_keepalive":
            console.log("Sesh refresh")
            break;
        default:
            console.log(json)
    }
}
