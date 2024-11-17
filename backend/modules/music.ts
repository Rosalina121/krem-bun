import { $ } from "bun"
import { MessageEvent, OverlayMessageType, OverlayMusicMessage, Track } from "../../common/types"


export async function initMusic(clients: any) {
    let currentTrack: Track

    setInterval(async () => {
        let artist: string = ""
        let title: string = ""
        let album: string = ""
        try {
            artist = await $`playerctl metadata artist`.text()
            title = await $`playerctl metadata title`.text()
            album = await $`playerctl metadata album`.text()
            console.log("retunrs:", {artist, title, album})
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
            clients.forEach((client: any) => {
                client.send(message);
            })
            console.log("sent to clients")
        }
    }, 2000)


}
