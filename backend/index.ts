// Base
import Bun from 'bun'

// Elysia
import { Elysia } from "elysia";
import { staticPlugin } from '@elysiajs/static';

// modules
import { initTwitch } from './modules/twitch';
import { initMusic } from './modules/music';
import { handleOBSRequest, initOBS } from './modules/obs';
import { DeckMessageType, OverlayMessageType, MessageEvent, OverlayActionMessage, OverlayTwitchMessage, DeckMessage, ClientWebSocket } from '../common/types';
import { initVnyan, sendToVnyan } from './modules/vnyan';

const app = new Elysia()

// frontend
app.use(staticPlugin({
    prefix: '',
    assets: "frontend/dist",
}))
app.get('/', async () => {
    return Bun.file('frontend/dist/index.html')
})
app.get('/overlay/*', async () => {
    return Bun.file('frontend/dist/index.html')
})
app.get('/admin/*', async () => {
    return Bun.file('frontend/dist/index.html')
})
app.get('/wait/*', async () => {
    return Bun.file('frontend/dist/index.html')
})

// nice type lol
const clients: ClientWebSocket[] = []

// init all
app.get('/init', () => {
    // register modules
    initTwitch(clients)
    initOBS()
        .then(() => {
            console.log('OBS WebSocket successfully connected and initialized');
        })
        .catch(error => {
            console.error('Failed to initialize OBS WebSocket:', error);
        });
    initMusic(clients)
    initVnyan()
})


app.get('/test/chat', () => {
    clients.forEach((ws) => {
        const tmpMessage: OverlayTwitchMessage = {
            event: MessageEvent.OVERLAY,
            type: OverlayMessageType.CHAT,
            data: {
                author: "Test message sender",
                message: "This is a test message " + ["!l", "!r", "!L", "!R", "and a super long test message, so you know, 2 lines and more. For testing duuuuh"][Math.floor(Math.random() * 5)],
                color: "#E66C9B",
                pictureURL: "https://cdn.bsky.app/img/avatar/plain/did:plc:3lnlnju5245yruv44ijo5lhe/bafkreiambmzieu6eqltr3r4hapzydzur4byjblot7umxwd2xu7xaghcoge@jpeg"
            }
        }
        ws.send(tmpMessage)
    })
})
app.get('/test/follow', () => {
    clients.forEach((ws) => {
        const tmpMessage: OverlayTwitchMessage = {
            event: MessageEvent.OVERLAY,
            type: OverlayMessageType.FOLLOW,
            data: {
                author: "New Follower",
                message: "ignored",
                color: "#E66C9B",
                pictureURL: "https://cdn.bsky.app/img/avatar/plain/did:plc:3lnlnju5245yruv44ijo5lhe/bafkreiambmzieu6eqltr3r4hapzydzur4byjblot7umxwd2xu7xaghcoge@jpeg"
            }
        }
        ws.send(tmpMessage)
    })
})

// websockets
app.ws('/ws', {
    async message(ws, rawMessage: unknown) {
        const message = rawMessage as DeckMessage;  // for now we only receive from Deck
        switch (message.event) {
            case MessageEvent.DECK:
                switch (message.type) {
                    case DeckMessageType.OBS:
                        await handleOBSRequest({
                            type: "scene",
                            data: {
                                scene: message.data.desc
                            }
                        });
                        break;
                    case DeckMessageType.OVERLAY: {
                        console.log("Overlay message:", message.data)
                        const overlayMessage: OverlayActionMessage = {
                            event: MessageEvent.OVERLAY,
                            type: OverlayMessageType.ACTION,
                            data: { action: message.data.desc }
                        }
                        clients.forEach((client) => {
                            client.send(overlayMessage);
                        });
                        break;
                    }
                    case DeckMessageType.VNYAN:
                        console.log("Vnyan message:", message.data)
                        sendToVnyan(message.data.desc)
                        break;
                    default:
                        console.log("No message type:", message.data)
                }
                break;
            default:
                console.log("Not deck message:", message)
        }
    },
    open(ws) {
        clients.push(ws)
        console.log("Client registered")
    },
    close(ws) {
        clients.forEach((item, index: number) => {
            if (item === ws) clients.splice(index, 1)
        })
    },
})

app.listen(3000, () => {
    console.log(`🦊 Elysia is running at http://${app.server?.hostname}:${app.server?.port}`);
})
