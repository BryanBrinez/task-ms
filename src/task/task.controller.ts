import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { TaskService } from './task.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { PaginationDto } from 'src/common/dto/pagination.dto';

@Controller()
export class TaskController {
  constructor(private readonly taskService: TaskService) {}

  @MessagePattern({ cmd: 'create_task' })
  create(@Payload() createTaskDto: CreateTaskDto) {
    return this.taskService.create(createTaskDto);
  }

  @MessagePattern({ cmd: 'find_all_tasks' })
  findAll(@Payload() paginationDto: PaginationDto) {
    return this.taskService.findAll(paginationDto);
  }

  @MessagePattern({ cmd: 'find_one_task' })
  findOne(@Payload() id: string) {
    return this.taskService.findOne(id);
  }

  @MessagePattern({ cmd: 'update_task' })
  update(@Payload() updateTaskDto: UpdateTaskDto) {
    return this.taskService.update(updateTaskDto.id, updateTaskDto);
  }

  @MessagePattern({ cmd: 'remove_task' })
  remove(@Payload() id: string) {
    return this.taskService.remove(id);
  }
}
