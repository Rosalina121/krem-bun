import { $ } from "bun";

// będziesz tego żałować
export async function playPipe() {
    await playSound("./backend/sounds/metal-pipe.mp3")
}

async function playSound(sound: string) {
    await $`ffplay -v 0 -nodisp -autoexit ${sound}`
}