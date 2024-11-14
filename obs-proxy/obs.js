import OBSWebSocket from 'obs-websocket-js';
import express from 'express'

const obs = new OBSWebSocket();

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

async function obsChangeToScene(scene) {
    // Change the preview scene
    const sceneName = scene; // replace with your scene name
    await obs.call("SetCurrentProgramScene", { sceneName });
    console.log(`Program scene changed to: ${sceneName}`);
}

connectToOBS();

const app = express()
const PORT = 8086

app.get('/program/:scene', async (req, res) => {
    await obsChangeToScene(req.params.scene).then(() => {
        res.send('Scene set').status(200)
    })
})
app.listen(PORT, () => {
    console.log(`OBS proxy listening on port ${PORT}`)
})
