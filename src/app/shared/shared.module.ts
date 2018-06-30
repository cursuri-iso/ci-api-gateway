import { Module } from '@nestjs/common';

import { ConfigurationService } from './configuration/configuration.service';
import { configurationServiceFactory } from './configuration/configuration-service.factory';
import { mqClientFactory } from './mq/mq-client.factory';
import { RabbitMQClient } from './mq/rabbit-client';
import { ClientProxy } from '@nestjs/microservices';

@Module({
    providers: [
        {
            provide: ConfigurationService,
            useFactory: configurationServiceFactory,
        }, {
            provide: RabbitMQClient,
            useFactory: mqClientFactory,
            inject: [ ConfigurationService ],
        },
    ],
    exports: [
        RabbitMQClient,
        ConfigurationService,
    ],
})
export class SharedModule {}