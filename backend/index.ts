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
import { DeckMessageType, OverlayMessageType, Message, MessageEvent, DeckMessage } from '../common/types';


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
let client: (ElysiaWS<Bun.ServerWebSocket<{ validator?: TypeCheck<TSchema>; }>, MergeSchema<UnwrapRoute<InputSchema<never>, {}>, {}> & { params: Record<never, string>; }, { decorator: {}; store: {}; derive: {}; resolve: {}; } & { derive: {}; resolve: {}; }>) | null;
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
                        try {
                            await fetch(`http://localhost:8086/program/${message.data.desc}`)
                                .then((res) => {
                                    console.log("Scene set to", message.data.desc)
                                })
                        } catch (e) {
                            console.error(e)
                        }
                        break;
                    case DeckMessageType.GODOT:
                        console.log("Godot message:", message.data)
                        break;
                    case DeckMessageType.VNYAN:
                        console.log("Vnyan message:", message.data)
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
        if (!client) {
            client = ws

            // register modules
            initTwitch(client)
            initOBS()
            initMusic(client)

        } else {
            console.log("there is one client already lol")
        }
    },
    close(ws, code, message) {
        if (client == ws) {
            client = null
        } else {
            console.log("Some other socket just closed, lol")
        }
    },
})


app.listen(3000, () => {
    console.log(`🦊 Elysia is running at http://${app.server?.hostname}:${app.server?.port}`);
})
