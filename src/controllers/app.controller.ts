import {Controller, Get} from '@nestjs/common';
import {AppService} from '../services/app.service';
import {TrackService} from '../services/track.service';

@Controller()
export class AppController {
    constructor(
        private readonly appService: AppService,
        private readonly trackService: TrackService,
    ) {}

    @Get()
    async getHello(): Promise<string> {
        this.trackService.start();
        return this.appService.getHello();
    }
}
