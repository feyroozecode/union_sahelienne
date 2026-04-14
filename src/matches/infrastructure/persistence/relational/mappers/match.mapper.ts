import {
  Match as PrismaMatch,
  User as PrismaUser,
  File as PrismaFile,
  Role as PrismaRole,
  Status as PrismaStatus,
  Profile as PrismaProfile,
} from '@prisma/client';
import { UserMapper } from '../../../../../users/infrastructure/persistence/relational/mappers/user.mapper';
import { Match } from '../../../../domain/match';

type MatchUser = PrismaUser & {
  photo: PrismaFile | null;
  role: PrismaRole | null;
  status: PrismaStatus | null;
  profile: PrismaProfile | null;
};

export type MatchWithRelations = PrismaMatch & {
  requester: MatchUser;
  target: MatchUser;
};

export class MatchMapper {
  static toDomain(raw: MatchWithRelations): Match {
    const domainEntity = new Match();
    domainEntity.id = raw.id;
    domainEntity.requesterId = raw.requesterId;
    domainEntity.targetId = raw.targetId;
    domainEntity.pairKey = raw.pairKey;
    domainEntity.status = raw.status;
    domainEntity.chatOpenedAt = raw.chatOpenedAt;
    domainEntity.chatExpiresAt = raw.chatExpiresAt;
    domainEntity.requester = UserMapper.toDomain(raw.requester);
    domainEntity.target = UserMapper.toDomain(raw.target);
    domainEntity.createdAt = raw.createdAt;
    domainEntity.updatedAt = raw.updatedAt;
    return domainEntity;
  }

  static toPersistence(domainEntity: Partial<Match>) {
    return {
      ...(domainEntity.id ? { id: domainEntity.id } : {}),
      ...(domainEntity.requesterId
        ? { requesterId: domainEntity.requesterId }
        : {}),
      ...(domainEntity.targetId ? { targetId: domainEntity.targetId } : {}),
      ...(domainEntity.pairKey !== undefined
        ? { pairKey: domainEntity.pairKey }
        : {}),
      ...(domainEntity.status !== undefined
        ? { status: domainEntity.status }
        : {}),
      ...(domainEntity.chatOpenedAt !== undefined
        ? { chatOpenedAt: domainEntity.chatOpenedAt }
        : {}),
      ...(domainEntity.chatExpiresAt !== undefined
        ? { chatExpiresAt: domainEntity.chatExpiresAt }
        : {}),
      ...(domainEntity.createdAt ? { createdAt: domainEntity.createdAt } : {}),
      ...(domainEntity.updatedAt ? { updatedAt: domainEntity.updatedAt } : {}),
    };
  }
}
