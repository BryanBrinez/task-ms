import { HttpStatus, Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { PrismaClient } from '@prisma/client';
import { NATS_SERVICE } from 'src/config/services';
import { ClientProxy, RpcException } from '@nestjs/microservices';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class TaskService extends PrismaClient implements OnModuleInit {

  constructor(

    @Inject(NATS_SERVICE) private readonly client: ClientProxy
  ) {

    super()
  }
  onModuleInit() {
    this.$connect();
  }



  async create(createTaskDto: CreateTaskDto) {

    try {

      const userExists = await firstValueFrom(
        this.client.send({ cmd: 'find_one_user' }, { id: createTaskDto.userId })
      );

      if (!userExists) {
        throw new RpcException('User not found');
      }


      const projectExists = await firstValueFrom(
        this.client.send({ cmd: 'find_one_project' }, createTaskDto.projectId)
      );
      if (!projectExists) {
        throw new RpcException('Project not found');
      }

      const task = this.task.create({
        data: createTaskDto,
      })

      return task


    } catch (error) {
      throw new RpcException({ message: error.message, status: HttpStatus.BAD_REQUEST });
    }

  }

  
  async findAll(paginationDto: PaginationDto) {

    const { page, limit } = paginationDto

    const totalPages = await this.task.count()

    const lastPages = Math.ceil(totalPages / limit)


    return {
      data: await this.task.findMany({
        skip: (page - 1) * limit,
        take: limit
      }),
      metadata: {
        totalPages: totalPages,
        page: page,
        lastPages: lastPages
      }


    }
  }

  findOne(id: number) {
    return `This action returns a #${id} task`;
  }

  update(id: number, updateTaskDto: UpdateTaskDto) {
    return `This action updates a #${id} task`;
  }

  remove(id: number) {
    return `This action removes a #${id} task`;
  }
}
