import * as amqp from 'amqplib';
import { ClientProxy, ReadPacket, WritePacket } from '@nestjs/microservices';

import * as UUID from 'uuid';

export class RabbitMQClient extends ClientProxy {
  private readonly connectionOptions: amqp.Options.Connect;

  private readonly queue: string;
  private server: amqp.Connection;
  private channel: amqp.Channel;

  async connect(): Promise<void> {
    this.server = await amqp.connect(this.connectionOptions);
    this.channel = await this.server.createChannel();
  }
  close() {
    this.channel && this.channel.close();
    this.server && this.server.close();
  }

  protected async publish(
    partialPacket: ReadPacket,
    callback: (packet: WritePacket) => any,
  ) {
    await this.sendSingleMessage(partialPacket, callback);
  }

  constructor(options) {
      super();
      this.connectionOptions = {
        hostname: options.hostname,
        port: options.port,
        username: options.username,
        password: options.password,
      };

      this.queue = options.queue;
    }

  protected async sendSingleMessage(messageObj, callback: (packet: WritePacket) => void) {
    await this.connect();
    this.channel.assertQueue(this.queue, { durable: false });

    const replyQueue = await this.channel.assertQueue('', { exclusive: true });
    const correlationId = UUID.v4();

    this.channel.consume(replyQueue.queue, (message) => {
      if (message.properties.correlationId === correlationId) {
        this.handleMessage(message, this.server, callback);
      }
    }, { noAck: true });

    this.channel.sendToQueue(this.queue, Buffer.from(JSON.stringify(messageObj)), {
      correlationId,
      replyTo: replyQueue.queue,
     });

    await this.close();
  }

  public async publishMessage(exchangeName: string, exchangeType: string, routingKey: string, headers: any, messageObj: any): Promise<boolean> {
    await this.connect();
    this.channel.assertExchange(exchangeName, exchangeType, { durable: false });

    return this.channel.publish(exchangeName, routingKey, Buffer.from(JSON.stringify(messageObj)), { headers });
  }

  private handleMessage(message, server, callback: (writePacket: WritePacket) => void) {
    const { content } = message;
    const { err, response, isDisposed } = JSON.parse(content.toString('utf8'));

    if (isDisposed) {
        server.close();
    }

    callback({ err, response, isDisposed });
  }
}