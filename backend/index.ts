// Base
import path from 'path'
import yaml from 'yaml'
import Bun from 'bun'

// Elysia
import { Elysia, InputSchema, MergeSchema, TSchema, UnwrapRoute } from "elysia";
import { staticPlugin } from '@elysiajs/static';
import { TypeCheck } from 'elysia/type-system';
import { ElysiaWS } from 'elysia/ws';

// modules
import { initTwitch } from './modules/twitch';
import { initMusic } from './modules/music';
import { handleOBSRequest, initOBS } from './modules/obs';
import { DeckMessageType, OverlayMessageType, Message, MessageEvent, DeckMessage, OverlayMessage, OverlayActionMessage } from '../common/types';
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
app.get('/look/*', async () => {
    return Bun.file('frontend/dist/index.html')
})



// nice type lol
let clients: (ElysiaWS<Bun.ServerWebSocket<{ validator?: TypeCheck<TSchema>; }>, MergeSchema<UnwrapRoute<InputSchema<never>, {}>, {}> & { params: Record<never, string>; }, { decorator: {}; store: {}; derive: {}; resolve: {}; } & { derive: {}; resolve: {}; }>)[] = []

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

app.get('/test', () => {
    clients.forEach((ws) => {
        const tmpMessage: any = {
            event: MessageEvent.OVERLAY,
            type: OverlayMessageType.CHAT,
            data: {
                author: "auth",
                message: "message",
                color: "#ffffff"
            }
        }
        ws.send(tmpMessage)
    })
})

// websockets
app.ws('/ws', {
    async message(ws, message: any) {
        message = message as Message
        switch (message.event) {
            case MessageEvent.DECK:
                switch (message.type) {
                    case DeckMessageType.OBS:
                        // temp until obs-websocket-js works under Bun
                        // or I write my own implementation (fat chance)
                        await handleOBSRequest({
                            type: "scene",
                            data: {
                                scene: message.data.desc
                            }
                        });
                        break;
                    case DeckMessageType.OVERLAY:
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
                    case DeckMessageType.VNYAN:
                        console.log("Vnyan message:", message.data)
                        sendToVnyan(message.data.desc)
                        break;
                    default:
                        console.log("No message type:", message.data)
                }
                break;
            default:
                console.log(message)
        }
    },
    open(ws) {
        clients.push(ws)
        console.log("Client registered")
    },
    close(ws, code, message) {
        clients.forEach((item, index) => {
            if (item === ws) clients.splice(index, 1)
        })
    },
})


app.listen(3000, () => {
    console.log(`🦊 Elysia is running at http://${app.server?.hostname}:${app.server?.port}`);
})
