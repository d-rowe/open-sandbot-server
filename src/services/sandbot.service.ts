import {Injectable} from '@nestjs/common';
import {SerialPort} from 'serialport';
import {
    SerialError,
    MovementLockError,
} from '../errors';
import {delay} from '../utils/timingUtils';

const HARDWARE_METADATA = {
    MANUFACTURER: 'Arduino',
    BAUD_RATE: 115_200,
} as const;

enum COMMAND {
    MOVE = 'MOVE',
    SET_SPEED = 'SET_SPEED',
    PAUSE = 'PAUSE',
    RESUME = 'RESUME',
    HOME = 'HOME',
}

export enum BOT_STATUS {
    MOVING = 'MOVING',
    IDLE = 'IDLE',
    DISCONNECTED = 'DISCONNECTED',
}

type Handler = () => void;

@Injectable()
export class SandbotService {
    private port: SerialPort;
    private status: BOT_STATUS = BOT_STATUS.DISCONNECTED;
    private moveDoneHandlers = new Set<Handler>([]);
    private MESSAGE_HANDLERS: Record<string, Handler> = {
        MOVE_DONE: this.handleMoveDone.bind(this),
    } as const;

    constructor() {
        this.connect();
        this.onMoveDone = this.onMoveDone.bind(this);
        this.offMoveDone = this.offMoveDone.bind(this);
        this.onConnectSuccess = this.onConnectSuccess.bind(this);
    }

    public async move(theta: number, rho: number) {
        if (this.status === BOT_STATUS.DISCONNECTED) {
            throw new SerialError('Cannot move when disconnected from sandbot');
        }

        if (this.status === BOT_STATUS.MOVING) {
            throw new MovementLockError('Movement in progress');
        }

        this.send(`${COMMAND.MOVE}:${theta} ${rho}`);
        this.status = BOT_STATUS.MOVING;

        const that = this;
        return new Promise<void>(resolve => {
            that.onMoveDone(doneHandler);

            function doneHandler() {
                that.status = BOT_STATUS.IDLE;
                that.offMoveDone(doneHandler);
                resolve();
            }
        });
    }

    public setSpeed(speed: number) {
        this.send(`${COMMAND.SET_SPEED}:${speed}`);
    }

    public pause() {
        this.send(COMMAND.PAUSE);
    }

    public resume() {
        this.send(COMMAND.RESUME);
    }

    public home() {
        this.send(COMMAND.HOME);
    }

    public getStatus(): BOT_STATUS {
        return this.status;
    }

    private send(message: string) {
        this.getPort().write(message);
    }

    private onMoveDone(handler: Handler) {
        this.moveDoneHandlers.add(handler);
    }

    private offMoveDone(handler: Handler) {
        this.moveDoneHandlers.delete(handler);
    }

    private handleMoveDone() {
        this.moveDoneHandlers.forEach(handler => handler());
    }

    private getPort(): SerialPort {
        if (!this.port) {
            throw new SerialError('Cannot use serial port before initialization');
        }

        return this.port;
    }

    private async connect() {
        let connected = false;

        while (!connected) {
            try {
                const portMetadataList = await SerialPort.list();
                const portMetadata = portMetadataList.find(m => {
                    return m.manufacturer === HARDWARE_METADATA.MANUFACTURER;
                });

                if (!portMetadata?.path) {
                    throw new SerialError('Could not find sandbot');
                }

                this.port = new SerialPort({
                    path: portMetadata.path,
                    baudRate: HARDWARE_METADATA.BAUD_RATE,
                });

                connected = true;
                console.info('Sandbot connected');
            } catch (err) {
                await delay(1_000);
            }
        }

        this.port.on('open', this.onConnectSuccess);
    }

    private async onConnectSuccess() {
        this.status = BOT_STATUS.IDLE;
        this.port.on('data', (data: Buffer) => {
            const message = getMessage(data);
            const handler = this.MESSAGE_HANDLERS[message];
            handler?.();
        });

        this.port.on('close', () => {
            this.port = undefined;
            this.status = BOT_STATUS.DISCONNECTED;
            this.connect();
        });
    }
}

function getMessage(buffer: Buffer): string {
    const lines = buffer.toString().split('\n');
    return lines[0].trim();
}
