import { $ } from "bun"
import { ClientWebSocket, MessageEvent, OverlayMessageType, OverlayMusicMessage, Track } from "../../common/types"


export async function initMusic(clients: ClientWebSocket[]) {
    let currentTrack: Track
    let wasError: boolean = false
    
    setInterval(async () => {
        let artist: string = ""
        let title: string = ""
        let album: string = ""
        try {
            artist = await $`playerctl metadata artist`.text()
            title = await $`playerctl metadata title`.text()
            album = await $`playerctl metadata album`.text()
        } catch {
            if (!wasError) {
                console.warn("No active player.")
                wasError = true
            }
        }
        const newTrack = { artist: artist.trim(), title: title.trim(), album: album.trim() }

        if (currentTrack?.title != newTrack.title) {
            wasError = false
            console.log("Now playing:", newTrack)

            currentTrack = newTrack;
            const message: OverlayMusicMessage = {
                event: MessageEvent.OVERLAY,
                type: OverlayMessageType.MUSIC,
                data: newTrack
            }
            clients.forEach((client) => {
                client.send(message);
            })
        }
    }, 2000)


}
