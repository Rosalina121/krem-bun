import express from 'express'
import path from 'path'
import yaml from 'yaml'
import Bun from 'bun'
import { Elysia } from "elysia";
import { staticPlugin } from '@elysiajs/static';

// modules
import { initTwitch } from './modules/twitch';


const app = new Elysia()

// frontend
app.use(staticPlugin({
  prefix: '',
  assets : "frontend/dist",
}))
app.get('/', async () => {
  return Bun.file('frontend/dist/index.html')
})

let client;
// websockets
app.ws('/ws', {
    message(ws, message) {
        client = ws
        console.log(message)
        ws.send({
            event: "godot",
            type: "chat",
            data: {
                author: "Poppi",
                message: "Die, die DIE",
                color: "#FFFFFF"
            }
        })
    },
})


app.listen(3000, () => {
  console.log(`🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`);
})

// Schedule
const scheduleFile = await Bun.file('backend/schedule.yaml').text()
const schedule = yaml.parse(scheduleFile)
console.log(schedule)

initTwitch(client)
