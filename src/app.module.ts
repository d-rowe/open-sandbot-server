import {Module} from '@nestjs/common';
import {AppController} from './controllers/app.controller';
import {TrackController} from './controllers/track.controller';
import {AppService} from './services/app.service';
import {SandbotService} from './services/sandbot.service';
import {TrackService} from './services/track.service';
@Module({
    controllers: [
        AppController,
        TrackController,
    ],
    providers: [
        AppService,
        TrackService,
        SandbotService,
    ],
})
export class AppModule {}
