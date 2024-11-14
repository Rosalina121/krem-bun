import OBSWebSocket from 'obs-websocket-js';

let obs: OBSWebSocket;

export function initOBS() {
    // obs = new OBSWebSocket()
    // connectToOBS()
}

async function connectToOBS() {
    try {
        // Replace 'your_password' with the OBS WebSocket password if set
        await obs.connect(
            "ws://localhost:4455",
            process.env.OBS_WS_PASSWORD || ""
        );
        console.log("Connected to OBS Studio");
    } catch (error) {
        console.error("Failed to connect or change scene:", error);
    }
}

export function handleOBSRequest(message: any) {
    if (message.type == "scene") {
        obsChangeToScene(message.data.scene)
    }
}

async function obsChangeToScene(scene: string) {
    await obs.call("SetCurrentProgramScene", { sceneName: scene });
    console.log(`Program scene changed to: ${scene}`);
}
