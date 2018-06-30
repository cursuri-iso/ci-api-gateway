import { ConfigurationService } from '../configuration/configuration.service';
import { RabbitMQClient } from './rabbit-client';
import { ClientProxy } from '@nestjs/microservices';

export const mqClientFactory = async (configManager: ConfigurationService) => {
    const config = configManager.getSettings();

    const options = {
        hostname: process.env.MQ_HOST || config.mq.hostname,
        port: process.env.MQ_PORT || config.mq.port,
        username: process.env.MQ_USERNAME || config.mq.username,
        password: process.env.MQ_PASSWORD || config.mq.password,
        queue: process.env.MQ_QUEUE || config.mq.queue,
    };

    const mqService = new RabbitMQClient(options);
    return mqService as ClientProxy;
};
