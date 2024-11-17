import { WebSocket } from 'ws';
import { createHash } from 'crypto';

interface OBSWebSocketConfig {
    address: string;
    password?: string;
}

class OBSWebSocketClient {
    private ws: WebSocket | null = null;
    private authenticated: boolean = false;
    private messageId: number = 1;
    private pendingRequests: Map<string, { resolve: Function; reject: Function }> = new Map();

    constructor(private config: OBSWebSocketConfig) {}

    public async connect(): Promise<void> {
        return new Promise((resolve, reject) => {
            try {
                this.ws = new WebSocket(this.config.address, {
                    protocolVersion: 13,
                    headers: {
                        'User-Agent': 'OBS WebSocket Client'
                    }
                });

                this.ws.on('open', () => {
                    console.log('WebSocket connection established');
                });

                this.ws.on('message', (data) => {
                    try {
                        const message = JSON.parse(data.toString());
                        console.log('Received message:', message); // Debug log
                        this.handleMessage(message);
                    } catch (error) {
                        console.error('Error parsing message:', error);
                    }
                });

                this.ws.on('error', (error) => {
                    console.error('WebSocket error:', error);
                    reject(error);
                });

                this.ws.on('close', (code, reason) => {
                    console.log('WebSocket connection closed:', code, reason.toString());
                    this.authenticated = false;
                });

            } catch (error) {
                reject(error);
            }
        });
    }

    private handleMessage(message: any) {
        console.log('Handling message:', message); // Debug log

        if (message.op === 0) { // Hello message
            console.log('Received Hello message'); // Debug log
            this.handleHello(message.d);
        } else if (message.op === 2) { // Identified message
            this.authenticated = true;
            console.log('Successfully authenticated with OBS');
        } else if (message.op === 7) { // RequestResponse message
            const request = this.pendingRequests.get(message.d.requestId);
            if (request) {
                if (message.d.requestStatus.result) {
                    request.resolve(message.d.responseData);
                } else {
                    request.reject(message.d.requestStatus.comment);
                }
                this.pendingRequests.delete(message.d.requestId);
            }
        }
    }

    private handleHello(data: any) {
        console.log('Handling Hello:', data); // Debug log
        
        const identifyMessage: any = {
            op: 1, // Identify operation
            d: {
                rpcVersion: 1,
                eventSubscriptions: 33 // Basic event subscriptions
            }
        };

        if (data.authentication) {
            const auth = this.generateAuthResponse(data.authentication);
            identifyMessage.d.authentication = auth;
        }

        console.log('Sending Identify message:', identifyMessage); // Debug log
        this.sendMessage(identifyMessage);
    }

    private generateAuthResponse(auth: { challenge: string; salt: string }): string {
        if (!this.config.password) return '';
        
        const password = this.config.password;
        const { challenge, salt } = auth;

        const secret = createHash('sha256')
            .update(password + salt)
            .digest('base64');

        const authResponse = createHash('sha256')
            .update(secret + challenge)
            .digest('base64');

        return authResponse;
    }

    private async sendRequest(requestType: string, requestData: any = {}): Promise<any> {
        if (!this.ws) {
            throw new Error('Not connected');
        }

        const requestId = String(this.messageId++);
        const request = {
            op: 6, // Request operation
            d: {
                requestType,
                requestId,
                requestData
            }
        };

        return new Promise((resolve, reject) => {
            this.pendingRequests.set(requestId, { resolve, reject });
            this.sendMessage(request);
        });
    }

    private sendMessage(message: any) {
        if (this.ws && this.ws.readyState === WebSocket.OPEN) {
            console.log('Sending message:', message); // Debug log
            this.ws.send(JSON.stringify(message));
        }
    }

    public async setCurrentScene(sceneName: string): Promise<void> {
        await this.sendRequest('SetCurrentProgramScene', {
            sceneName
        });
    }

    public disconnect(): void {
        if (this.ws) {
            this.ws.close();
            this.ws = null;
        }
    }
}

// Singleton instance
let obsClient: OBSWebSocketClient | null = null;

export function initOBS(): Promise<void> {
    obsClient = new OBSWebSocketClient({
        address: 'ws://localhost:4455',
        password: process.env.OBS_WS_PASSWORD
    });
    
    return obsClient.connect();
}

export async function handleOBSRequest(message: any): Promise<void> {
    if (!obsClient) {
        throw new Error('OBS client not initialized');
    }

    if (message.type === "scene") {
        try {
            await obsClient.setCurrentScene(message.data.scene);
            console.log(`Program scene changed to: ${message.data.scene}`);
        } catch (error) {
            console.error('Failed to change scene:', error);
            throw error;
        }
    }
}