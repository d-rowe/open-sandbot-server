import * as LineReader from 'n-readlines';
import * as path from 'path';
import * as fs from 'fs/promises';
import {Injectable} from '@nestjs/common';
import {SandbotService} from './sandbot.service';

const TRACK_DIR = path.join(process.cwd(), 'tracks');
const TRACK_EXTENSION = 'thr';

@Injectable()
export class TrackService {
    private theta: number = 0;
    private rho: number = 1;
    private lineReader: LineReader | null = null;
    private paused = false;
    constructor(private readonly sandbot: SandbotService) {}

    public start(name: string) {
        const trackPath = path.join(TRACK_DIR, `${name}.${TRACK_EXTENSION}`);
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

    public stop() {
        this.paused = false;
        this.lineReader = null;
    }

    public async getTracks(): Promise<string[]> {
        const files = await fs.readdir(TRACK_DIR);
        return files.map(f => f.replace(TRACK_EXTENSION, ''));
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
