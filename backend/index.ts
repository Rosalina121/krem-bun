import express from 'express'
import path from 'path'
import yaml from 'yaml'
import Bun from 'bun'
import { Elysia, InputSchema, MergeSchema, TSchema, UnwrapRoute } from "elysia";
import { staticPlugin } from '@elysiajs/static';

// modules
import { initTwitch } from './modules/twitch';
import { TypeCheck } from 'elysia/type-system';
import { ElysiaWS } from 'elysia/ws';


const app = new Elysia()

// frontend
app.use(staticPlugin({
  prefix: '',
  assets : "frontend/dist",
}))
app.get('/', async () => {
  return Bun.file('frontend/dist/index.html')
})

// nice type lol
let client: (ElysiaWS<Bun.ServerWebSocket<{ validator?: TypeCheck<TSchema>; }>, MergeSchema<UnwrapRoute<InputSchema<never>, {}>, {}> & { params: Record<never, string>; }, { decorator: {}; store: {}; derive: {}; resolve: {}; } & { derive: {}; resolve: {}; }>) | null;
// websockets
app.ws('/ws', {
    message(ws, message) {
        console.log(message)
    },
    open(ws) {
        if (!client) {
            client = ws
            initTwitch(client)    
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
  console.log(`🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`);
})

// Schedule
const scheduleFile = await Bun.file('backend/schedule.yaml').text()
const schedule = yaml.parse(scheduleFile)
console.log(schedule)

