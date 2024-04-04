const LineReader = require('n-readlines');
const path = require('path');
const fs = require('fs/promises');
import {Injectable} from '@nestjs/common';
import {SandbotService} from './sandbot.service';

const trackDir = path.join(process.cwd(), 'tracks');

@Injectable()
export class TrackService {
    private theta: number = 0;
    private rho: number = 1;
    private lineReader;
    private paused = false;
    constructor(private readonly sandbot: SandbotService) {}

    async start(name: string) {
        const trackFile = path.join(trackDir, `${name}.thr`);
        this.lineReader = new LineReader(trackFile);
        this.processFile();
    }

    async getTracks(): Promise<string[]> {
        const files = await fs.readdir(trackDir);
        return files.map(f => f.replace('.thr', ''));
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

        this.theta = theta;
        this.rho = rho;
        await this.sandbot.move(theta, rho);
    }
}
