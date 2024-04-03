const fs = require('fs');
const LineReader = require('n-readlines');
const path = require('path');
import {Injectable} from '@nestjs/common';
import {BOT_STATUS, SandbotService} from './sandbot.service';

const trackPath = '/Users/daniel/Projects/open-sandbot-server/tracks/LinedCircles4.thr';

@Injectable()
export class TrackService {
    private theta: number = 0;
    private rho: number = 1;
    constructor(private readonly sandbot: SandbotService) {}

    async start() {
        if (this.sandbot.getStatus() !== BOT_STATUS.IDLE) {
            return;
        }

        const rl = new LineReader(trackPath);
        let line: string | undefined;
        while (line = rl.next()) {
            const [sTheta, sRho] = line.toString().split(' ');
            const theta = Number(sTheta);
            const rho = Number(sRho);
            if (theta === this.theta && rho === this.rho) {
                continue;
            }

            await this.sandbot.move(theta, rho);
            this.theta = theta;
            this.rho = rho;
        }
    }

    pause() {
        this.sandbot.pause();
    }

    resume() {
        this.sandbot.resume();
    }

    getSandbotStatus(): BOT_STATUS {
        return this.sandbot.getStatus();
    }
}
