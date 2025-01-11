import { Module } from '@nestjs/common';
import { TaskService } from './task.service';
import { TaskController } from './task.controller';
import { NatsModule } from 'src/transports/nats.module';

@Module({
  controllers: [TaskController],
  providers: [TaskService],
  imports: [NatsModule],
})
export class TaskModule {}
