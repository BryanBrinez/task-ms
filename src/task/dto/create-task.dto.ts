import { IsEnum, IsString } from 'class-validator';

export enum TaskStatus {
  PENDING = 'PENDING',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
}

export class CreateTaskDto {
  @IsString()
  title: string;

  @IsEnum(TaskStatus)
  status: TaskStatus;

  @IsString()
  userId: string;

  @IsString()
  projectId: string;
}