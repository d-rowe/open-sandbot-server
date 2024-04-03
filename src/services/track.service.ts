const LineReader = require('n-readlines');
const path = require('path');
import {Injectable} from '@nestjs/common';
import {BOT_STATUS, SandbotService} from './sandbot.service';

const trackPath = path.join(process.cwd(), 'tracks', 'LinedCircles4.thr');

@Injectable()
export class TrackService {
    private theta: number = 0;
    private rho: number = 1;
    private lineReader;
    private paused = false;
    constructor(private readonly sandbot: SandbotService) {}

    async start() {
        if (this.sandbot.getStatus() !== BOT_STATUS.IDLE) {
            return;
        }

        this.lineReader = new LineReader(trackPath);
        this.processFile();
    }

    public pause() {
        this.paused = true;
    }

    public resume() {
        this.paused = false;
        this.processFile();
    }

    public getSandbotStatus(): BOT_STATUS {
        return this.sandbot.getStatus();
    }

    private async processFile() {
        if (!this.lineReader) {
            return;
        }

        while (!this.paused) {
            const line = this.lineReader.next();
            if (!line) {
                break;
            }
            await this.processLine(line);
        }
    }

    private async processLine(line: Buffer) {
        const [sTheta, sRho] = line.toString().split(' ');
        const theta = Number(sTheta);
        const rho = Number(sRho);
        if (theta === this.theta && rho === this.rho) {
            return;
        }

        await this.sandbot.move(theta, rho);
        this.theta = theta;
        this.rho = rho;
    }
}
