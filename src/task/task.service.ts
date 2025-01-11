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
  constructor(@Inject(NATS_SERVICE) private readonly client: ClientProxy) {
    super();
  }
  onModuleInit() {
    this.$connect();
  }

  async create(createTaskDto: CreateTaskDto) {
    try {
      const userExists = await firstValueFrom(
        this.client.send(
          { cmd: 'find_one_user' },
          { id: createTaskDto.userId },
        ),
      );

      if (!userExists) {
        throw new RpcException('User not found');
      }

      const task = this.task.create({
        data: createTaskDto,
      });

      return task;
    } catch (error) {
      throw new RpcException({
        message: error.message,
        status: HttpStatus.BAD_REQUEST,
      });
    }
  }

  async findAll(paginationDto: PaginationDto) {
    const { page, limit } = paginationDto;

    const totalPages = await this.task.count();

    const lastPages = Math.ceil(totalPages / limit);

    return {
      data: await this.task.findMany({
        skip: (page - 1) * limit,
        take: limit,
      }),
      metadata: {
        totalPages: totalPages,
        page: page,
        lastPages: lastPages,
      },
    };
  }

  async findOne(id: string) {
    try {
      const task = await this.task.findUnique({
        where: {
          id: id,
        },
      });

      return task;
    } catch (error) {
      console.error('Error while fetching projects:', error);
      throw new RpcException({
        message: 'Algo ha fallado, comunicate con tu administrador',
        status: HttpStatus.BAD_REQUEST,
      });
    }
  }

  async update(id: string, updateTaskDto: UpdateTaskDto) {
    const { id: __, ...data } = updateTaskDto;
    console.log(__);

    try {
      await this.findOne(id);
    } catch (error) {
      console.log(error);
      throw new RpcException({
        message: `User with id ${id} not found`,
        status: HttpStatus.BAD_REQUEST,
      });
    }

    return this.task.update({
      where: { id },
      data: data,
    });
  }

  async remove(id: string) {
    try {
      const taskExists = await this.task.findUnique({
        where: {
          id: id,
        },
      });

      if (!taskExists) {
        throw new RpcException({
          message: `Task with id ${id} not found`,
          status: HttpStatus.BAD_REQUEST,
        });
      }

      const taskDeleted = await this.task.delete({
        where: {
          id: id,
        },
      });

      return taskDeleted;
    } catch (error) {
      throw new RpcException({
        message: error.message || 'An error occurred',
        status: HttpStatus.BAD_REQUEST,
      });
    }
  }
}
