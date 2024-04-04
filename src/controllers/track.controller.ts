import {
    Controller,
    Get,
    Param,
    Post,
} from '@nestjs/common';
import {TrackService} from '../services/track.service';

@Controller()
export class TrackController {
    constructor(private readonly trackService: TrackService) {}

    @Post('/api/tracks/start/:trackName')
    async start(@Param() param): Promise<void> {
        this.trackService.start(param.trackName);
    }

    @Get('/api/tracks')
    async getTracks() {
        return this.trackService.getTracks();
    }
}
