import {
    Body,
    Controller,
    Get,
    HttpException,
    Post,
} from '@nestjs/common';
import {TrackService} from '../services/track.service';
import {SandbotService} from 'src/services/sandbot.service';

type StartTrackParams = {
    track: string,
};

type SetSpeedParams = {
    speed: number,
};

@Controller()
export class TrackController {
    constructor(
        private readonly trackService: TrackService,
        private readonly sandbotService: SandbotService,
    ) {}

    @Post('/api/tracks/start')
    async start(@Body() params: StartTrackParams): Promise<void> {
        try {
            this.trackService.start(params.track);
        } catch (err) {
            throw new HttpException(err.message, 500);
        }
    }

    @Post('/api/tracks/speed')
    async setSpeed(@Body() params: SetSpeedParams): Promise<void> {
        try {
            this.sandbotService.setSpeed(params.speed);
        } catch (err) {
            throw new HttpException(err.message, 500);
        }
    }

    @Post('/api/track/pause')
    async pause(): Promise<void> {
        try {
            this.trackService.pause();
        } catch (err) {
            throw new HttpException(err.message, 500);
        }
    }

    @Post('/api/track/resume')
    async resume(): Promise<void> {
        try {
            this.trackService.resume();
        } catch (err) {
            throw new HttpException(err.message, 500);
        }
    }

    @Get('/api/tracks')
    async getTracks() {
        return this.trackService.getTracks();
    }
}
