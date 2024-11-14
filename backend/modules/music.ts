import { $ } from "bun"
import { MessageEvent, OverlayMessageType, OverlayMusicMessage, Track } from "../../common/types"


export async function initMusic(client: any) {
    let currentTrack: Track

    setInterval(async () => {
        const artist = await $`playerctl metadata artist`.text()
        const title = await $`playerctl metadata title`.text()
        const album = await $`playerctl metadata album`.text()
        const newTrack = { artist: artist.trim(), title: title.trim(), album: album.trim() }

        if (currentTrack?.title != newTrack.title) {
            console.log("Now playing:", newTrack)

            currentTrack = newTrack;
            const message: OverlayMusicMessage = {
                event: MessageEvent.OVERLAY,
                type: OverlayMessageType.MUSIC,
                data: newTrack
            }
            client.send(message)
        }
    }, 2000)


}
