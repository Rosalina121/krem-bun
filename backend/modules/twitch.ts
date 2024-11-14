import { TwitchApi } from "node-twitch";
import * as tmi from "tmi.js";
import { OverlayMessageType, OverlayTwitchMessage, MessageEvent } from "../../common/types";

let accessToken: string;
let twitch: TwitchApi;
let chatSocket: tmi.Client; 
let followSocket: any;    // event socket tbh, but follow for now

export async function initTwitch(client: any) {
    twitch = new TwitchApi({
        client_id: process.env.TWITCH_CLIENT_ID || "",
        client_secret: process.env.TWITCH_CLIENT_SECRET || "",
    });

    accessToken = await getAccessToken()

    chatSocket = new tmi.client({
        channels: ["kremstream"],
    });
    chatSocket.connect()
    chatSocket.on("message", (channel: any, tags: any, message: any, self: any) => handleChatMessage(channel, tags, message, client))

    followSocket = new WebSocket("wss://eventsub.wss.twitch.tv/ws");
    followSocket.onopen = (event: any) => console.log("Connected to follow socket");
    followSocket.onerror = (error: any) => console.error("TwitchWebSocket error:", error);
    followSocket.onmessage = (data: any) => handleFollow(data.data, client);
}

async function getUserColor(username: string) {
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
    return data.data[0].color;
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

async function handleChatMessage(channel: any, tags: any, message: any, client: any) {
    // TODO: store colors per sesssion. Not many viewers now so no need for lol
    const userColor = (await getUserColor(tags.username)) || "#FF6395";
    // Send to the first connected client
    const tmpMessage: OverlayTwitchMessage = {
        event: MessageEvent.OVERLAY,
        type: OverlayMessageType.CHAT,
        data: {
            author: tags.username,
            message: message,
            color: userColor
        }
    }
    client.send(tmpMessage);

    console.log(
        `[${new Date().toJSON()}] ${tags.username}: ${message}. Color: ${userColor}`
    );
}

async function handleFollow(data: any, client: any) {
    const json = JSON.parse(data);
    const messageType = json?.metadata?.message_type
    switch (messageType) {
        case "session_welcome":
        console.log("debug", process.env.TWITCH_USER_TOKEN)
            const sessionId = json.payload.session.id;
            fetch(
                "https://api.twitch.tv/helix/eventsub/subscriptions",
                {
                    method: "post",
                    headers: {
                        "Client-ID": process.env.TWITCH_CLIENT_ID,
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
                            session_id: sessionId,
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
                const userColor = await getUserColor(json.payload.event.user_name) || "#FF6395";
                const tmpMessage: OverlayTwitchMessage = {
                    event: MessageEvent.OVERLAY,
                    type: OverlayMessageType.FOLLOW,
                    data: {
                        author: json.payload.event.user_name,
                        message: "PathFollow3D",
                        color: userColor
                    }
                }
                client.send(tmpMessage)
            }
            break;
        case "session_keepalive":
            console.log("Sesh refresh")
            break;
        default:
            console.log(json)
    }
}
