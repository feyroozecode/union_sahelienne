import {
  Prisma,
  Session as PrismaSession,
  User as PrismaUser,
  File as PrismaFile,
  Role as PrismaRole,
  Status as PrismaStatus,
} from '@prisma/client';
import { UserMapper } from '../../../../../users/infrastructure/persistence/relational/mappers/user.mapper';
import { Session } from '../../../../domain/session';

export type SessionWithUser = PrismaSession & {
  user: PrismaUser & {
    photo: PrismaFile | null;
    role: PrismaRole | null;
    status: PrismaStatus | null;
  };
};

export class SessionMapper {
  static toDomain(raw: SessionWithUser): Session {
    const domainEntity = new Session();
    domainEntity.id = raw.id;
    if (raw.user) {
      domainEntity.user = UserMapper.toDomain(raw.user);
    }
    domainEntity.hash = raw.hash;
    domainEntity.createdAt = raw.createdAt;
    domainEntity.updatedAt = raw.updatedAt;
    domainEntity.deletedAt = (raw.deletedAt ?? null) as Date;
    return domainEntity;
  }

  static toPersistence(
    domainEntity: Session,
  ): Prisma.SessionUncheckedCreateInput {
    return {
      ...(domainEntity.id && typeof domainEntity.id === 'number'
        ? { id: domainEntity.id }
        : {}),
      hash: domainEntity.hash,
      userId: Number(domainEntity.user.id),
      createdAt: domainEntity.createdAt,
      deletedAt: domainEntity.deletedAt,
    };
  }
}
