import { $ } from "bun"
import { MessageEvent, OverlayMessageType, OverlayMusicMessage, Track } from "../../common/types"


export async function initMusic(client: any) {
    let currentTrack: Track

    setInterval(async () => {
        let artist: string = ""
        let title: string = ""
        let album: string = ""
        try {
            const artist = await $`playerctl metadata artist`.text()
            const title = await $`playerctl metadata title`.text()
            const album = await $`playerctl metadata album`.text()
        } catch {
            // do nothing?
            console.warn("No active palyer.")
        }

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
