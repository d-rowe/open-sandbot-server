import {Injectable} from '@nestjs/common';
import {SerialPort} from 'serialport';
import {ReadlineParser} from '@serialport/parser-readline';
import {SerialError} from '../errors';
import {delay} from '../utils/timingUtils';

const HARDWARE_CONFIG = {
    MANUFACTURER: 'Raspberry Pi',
    BAUD_RATE: 115_200,
    CONNECTION_RETRY_DELAY: 1_000,
} as const;

enum STATUS {
    MOVING = 'MOVING',
    IDLE = 'IDLE',
    DISCONNECTED = 'DISCONNECTED',
}

const MESSAGE_STATUS_MAP = {
    'STATUS MOVING': STATUS.MOVING,
    'STATUS IDLE': STATUS.IDLE,
}

enum COMMAND {
    MOVE = 'MOVE',
    SPEED = 'SPEED',
    PAUSE = 'PAUSE',
    RESUME = 'RESUME',
    STOP = 'STOP',
    HOME = 'HOME',
}

type EventListeners = Record<STATUS, Set<CallableFunction>>;

@Injectable()
export class SandbotService {
    private parser: ReadlineParser;
    private port: SerialPort;
    private status: STATUS = STATUS.DISCONNECTED;
    private eventListeners: EventListeners;
    private theta: number = 0;
    private rho: number = 1;

    constructor() {
        this.connect();
        this.eventListeners = {
            [STATUS.DISCONNECTED]: new Set<CallableFunction>(),
            [STATUS.IDLE]: new Set<CallableFunction>(),
            [STATUS.MOVING]: new Set<CallableFunction>(),
        };
        this.handleDisconnect = this.handleDisconnect.bind(this);
        this.handleMessageData = this.handleMessageData.bind(this);
        this.handlePortOpen = this.handlePortOpen.bind(this);
    }

    private async connect() {
        while (this.status === STATUS.DISCONNECTED) {
            try {
                const portMetadataList = await SerialPort.list();
                const portMetadata = portMetadataList.find(m => {
                    return m.manufacturer === HARDWARE_CONFIG.MANUFACTURER;
                });

                if (!portMetadata?.path) {
                    throw new SerialError('Could not find sandbot');
                }

                this.port = new SerialPort({
                    path: portMetadata.path,
                    baudRate: HARDWARE_CONFIG.BAUD_RATE,
                });

                this.setStatus(STATUS.IDLE);
            } catch (err) {
                await delay(HARDWARE_CONFIG.CONNECTION_RETRY_DELAY);
            }
        }
        this.port.on('open', this.handlePortOpen);
    }

    public async move(theta: number, rho: number) {
        if (theta === this.theta && rho === this.rho) {
            return;
        }

        this.send(`${COMMAND.MOVE} ${theta} ${rho}`);
        this.setStatus(STATUS.MOVING);
        await this.reachedStatus(STATUS.IDLE);
        this.theta = theta;
        this.rho = rho;
    }

    public setSpeed(speed: number) {
        this.send(`${COMMAND.SPEED}:${speed}`);
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

    private handlePortOpen() {
        this.setStatus(STATUS.IDLE);
        this.parser = this.port.pipe(new ReadlineParser());
        this.parser.on('data', this.handleMessageData);
        this.port.on('close', this.handleDisconnect);
    }

    private handleMessageData(message: string) {
        const status = MESSAGE_STATUS_MAP[message];

        if (status) {
            this.setStatus(status);
            return;
        } else {
            this.setStatus(STATUS.IDLE);
        }

    }

    public on(status: STATUS, callback: CallableFunction) {
        this.eventListeners[status].add(callback);
    }

    public off(status: STATUS, callback: CallableFunction) {
        this.eventListeners[status].delete(callback);
    }

    public once(status: STATUS, callback: CallableFunction) {
        const wrapper = () => {
            this.off(status, wrapper);
            callback();
        };

        this.on(status, wrapper);
    }

    public async reachedStatus(status: STATUS) {
        if (this.status === status) {
            return;
        }

        return new Promise(resolve => this.once(status, resolve));
    }

    private send(message: string) {
        if (this.status === STATUS.DISCONNECTED) {
            throw new Error('Cannot send message when disconnected');
        }
        this.getPort().write(message + '\n');
    }

    private handleDisconnect() {
        this.setStatus(STATUS.DISCONNECTED);
        this.connect();
    }

    private setStatus(status: STATUS) {
        console.log("setting status:", status);
        if (this.status === status) {
            return;
        }
        this.status = status;
        this.eventListeners[status].forEach(h => h());
    }

    private getPort(): SerialPort {
        if (!this.port) {
            throw new SerialError('Cannot use serial port before initialization');
        }

        return this.port;
    }
}
