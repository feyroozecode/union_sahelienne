import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../../database/prisma.service';
import { FileRepository } from '../../file.repository';
import { FileMapper } from '../mappers/file.mapper';
import { FileType } from '../../../../domain/file';
import { NullableType } from '../../../../../utils/types/nullable.type';

@Injectable()
export class FileRelationalRepository implements FileRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: FileType): Promise<FileType> {
    const entity = await this.prisma.file.create({
      data: FileMapper.toPersistence(data),
    });
    return FileMapper.toDomain(entity);
  }

  async findById(id: FileType['id']): Promise<NullableType<FileType>> {
    const entity = await this.prisma.file.findUnique({
      where: { id },
    });
    return entity ? FileMapper.toDomain(entity) : null;
  }

  async findByIds(ids: FileType['id'][]): Promise<FileType[]> {
    const entities = await this.prisma.file.findMany({
      where: { id: { in: ids } },
    });
    return entities.map((e) => FileMapper.toDomain(e));
  }
}
