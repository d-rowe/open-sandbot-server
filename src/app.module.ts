import {Module} from '@nestjs/common';
import {AppController} from './controllers/app.controller';
import {SandbotController} from './controllers/sandbot.controller';
import {TrackController} from './controllers/track.controller';
import {AppService} from './services/app.service';
import {SandbotService} from './services/sandbot.service';
import {TrackService} from './services/track.service';

@Module({
    imports: [],
    controllers: [
        AppController,
        SandbotController,
        TrackController,
    ],
    providers: [
        AppService,
        TrackService,
        SandbotService,
    ],
})
export class AppModule {}
