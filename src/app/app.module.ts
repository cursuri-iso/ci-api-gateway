import { Module } from '@nestjs/common';
import { SharedModule } from './shared/shared.module';
import { Patterns } from './utils/patterns';
import { Seed } from './config/seed';
import { Observable, pipe, of, from, concat, forkJoin, timer, interval } from 'rxjs';
import { map, flatMap, filter, mergeMap, scan, tap, catchError, delayWhen } from 'rxjs/operators';
import { RabbitMQClient } from './shared/mq/rabbit-client';

@Module({
  imports: [SharedModule],
  controllers: [],
  providers: [],
})
export class AppModule {
  constructor(private mq: RabbitMQClient) { }
  async onModuleInit() {
    Seed.Entities.forEach((entity: string) => {
      const data: any = {
        filter: { name: entity },
        limit: 1,
        offset: 0,
      };

      this.mq.send({ cmd: 'find-entities' }, data)
        .subscribe((result: any) => {
          console.log(result);
        });
    });
  }
}
