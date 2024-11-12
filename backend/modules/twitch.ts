import { TwitchApi } from "node-twitch";
import * as tmi from "tmi.js";

let accessToken: string;
let twitch: TwitchApi;
let chatSocket: any;    // actually a tmi.client

export async function initTwitch(client: any) {
    twitch = new TwitchApi({
        client_id: process.env.TWITCH_CLIENT_ID || "",
        client_secret: process.env.TWITCH_CLIENT_SECRET || "",
    });
    accessToken = await getAccessToken()
    const color = await getUserColor('alina_rosa')
    console.log("color:", color)

    chatSocket = new tmi.client({
        channels: ["kremstream"],
    });
    chatSocket.connect()
    chatSocket.on("message", (channel: any, tags: any, message: any, self: any) => handleChatMessage(channel, tags, message, client))

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
    const userColor = (await getUserColor(tags.username)) || "#FF6395";
    // Send to the first connected client
    client.send({
        event: "godot",
        type: "chat",
        data: {
            author: tags.username,
            message: message,
            color: userColor
        }
    });

    console.log(
        `[${channel}] ${tags.username}: ${message}. Color: ${userColor}`
    );
}
