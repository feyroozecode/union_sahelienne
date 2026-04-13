import {
  Prisma,
  User as PrismaUser,
  File as PrismaFile,
  Role as PrismaRole,
  Status as PrismaStatus,
} from '@prisma/client';
import { FileMapper } from '../../../../../files/infrastructure/persistence/relational/mappers/file.mapper';
import { User } from '../../../../domain/user';

export type UserWithRelations = PrismaUser & {
  photo: PrismaFile | null;
  role: PrismaRole | null;
  status: PrismaStatus | null;
};

export class UserMapper {
  static toDomain(raw: UserWithRelations): User {
    const domainEntity = new User();
    domainEntity.id = raw.id;
    domainEntity.email = raw.email;
    domainEntity.password = raw.password ?? undefined;
    domainEntity.provider = raw.provider;
    domainEntity.socialId = raw.socialId;
    domainEntity.firstName = raw.firstName;
    domainEntity.lastName = raw.lastName;
    domainEntity.photo = raw.photo ? FileMapper.toDomain(raw.photo) : null;
    domainEntity.role = raw.role
      ? { id: raw.role.id, name: raw.role.name }
      : null;
    domainEntity.status = raw.status
      ? { id: raw.status.id, name: raw.status.name }
      : undefined;
    domainEntity.createdAt = raw.createdAt;
    domainEntity.updatedAt = raw.updatedAt;
    domainEntity.deletedAt = (raw.deletedAt ?? null) as Date;
    return domainEntity;
  }

  static toPersistence(domainEntity: User): Prisma.UserUncheckedCreateInput {
    return {
      ...(domainEntity.id && typeof domainEntity.id === 'number'
        ? { id: domainEntity.id }
        : {}),
      email: domainEntity.email,
      password: domainEntity.password,
      provider: domainEntity.provider,
      socialId: domainEntity.socialId,
      firstName: domainEntity.firstName,
      lastName: domainEntity.lastName,
      photoId: domainEntity.photo?.id ?? null,
      roleId: domainEntity.role ? Number(domainEntity.role.id) : null,
      statusId: domainEntity.status ? Number(domainEntity.status.id) : null,
      createdAt: domainEntity.createdAt,
      deletedAt: domainEntity.deletedAt,
    };
  }
}
