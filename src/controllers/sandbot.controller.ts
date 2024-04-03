import {Controller, Get} from '@nestjs/common';
import {SandbotService} from '../services/sandbot.service';

@Controller()
export class SandbotController {
    constructor(private readonly sandbotService: SandbotService) {}

    @Get('/api/sandbot/status')
    async getStatus(): Promise<string> {
        return this.sandbotService.getStatus();
    }
}
