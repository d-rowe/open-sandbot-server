import {
    Body,
    Controller,
    Get,
    HttpException,
    Post,
} from '@nestjs/common';
import {TrackService} from '../services/track.service';

@Controller()
export class TrackController {
    constructor(private readonly trackService: TrackService) {}

    @Post('/api/tracks/start')
    async start(@Body() body): Promise<void> {
        console.log(body);
        try {
            this.trackService.start(body.trackName);
        } catch (err) {
            throw new HttpException(err.message, 500);
        }
    }

    @Get('/api/tracks')
    async getTracks() {
        return this.trackService.getTracks();
    }
}
