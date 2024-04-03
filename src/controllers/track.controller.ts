import {
    Controller,
    Get,
    HttpStatus,
    HttpException,
    Post,
} from '@nestjs/common';
import {TrackService} from '../services/track.service';
import {BOT_STATUS} from 'src/services/sandbot.service';

@Controller()
export class TrackController {
    constructor(private readonly trackService: TrackService) {}

    @Post('/api/tracks/start')
    async start(): Promise<void> {
        const sandbotStatus = this.trackService.getSandbotStatus();
        if (sandbotStatus === BOT_STATUS.DISCONNECTED) {
            throw new HttpException('Sandbot not connected', HttpStatus.CONFLICT);
        }

        if (sandbotStatus === BOT_STATUS.MOVING) {
            throw new HttpException('Sandbot movement already in progress', HttpStatus.CONFLICT);
        }

        this.trackService.start();
    }

    @Post('/api/tracks/pause')
    pause() {
        this.trackService.pause();
    }

    @Post('/api/tracks/resume')
    resume() {
        this.trackService.resume();
    }

    @Get('/api/tracks')
    async getTracks() {
        return [];
    }
}
