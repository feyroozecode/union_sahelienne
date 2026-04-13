import { Prisma, File as PrismaFile } from '@prisma/client';
import { FileType } from '../../../../domain/file';

export class FileMapper {
  static toDomain(raw: PrismaFile): FileType {
    const domainEntity = new FileType();
    domainEntity.id = raw.id;
    domainEntity.path = raw.path;
    return domainEntity;
  }

  static toPersistence(
    domainEntity: FileType,
  ): Prisma.FileUncheckedCreateInput {
    return {
      id: domainEntity.id,
      path: domainEntity.path,
    };
  }
}
