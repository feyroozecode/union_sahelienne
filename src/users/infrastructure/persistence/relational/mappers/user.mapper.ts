import {
  Prisma,
  User as PrismaUser,
  File as PrismaFile,
  Role as PrismaRole,
  Status as PrismaStatus,
  Profile as PrismaProfile,
} from '@prisma/client';
import { FileMapper } from '../../../../../files/infrastructure/persistence/relational/mappers/file.mapper';
import { ProfileMapper } from '../../../../../profiles/infrastructure/persistence/relational/mappers/profile.mapper';
import { User } from '../../../../domain/user';

export type UserWithRelations = PrismaUser & {
  photo: PrismaFile | null;
  role: PrismaRole | null;
  status: PrismaStatus | null;
  profile?: PrismaProfile | null;
};

export class UserMapper {
  static toDomain(raw: UserWithRelations): User {
    const domainEntity = new User();
    domainEntity.id = raw.id;
    domainEntity.email = raw.email;
    domainEntity.phone = raw.phone;
    domainEntity.password = raw.password ?? undefined;
    domainEntity.otpHash = raw.otpHash;
    domainEntity.otpPurpose = raw.otpPurpose;
    domainEntity.otpExpiry = raw.otpExpiry;
    domainEntity.lastOtpAt = raw.lastOtpAt;
    domainEntity.lastLoginAt = raw.lastLoginAt;
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
    domainEntity.profile = raw.profile
      ? ProfileMapper.toDomain(raw.profile)
      : null;
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
      phone: domainEntity.phone,
      password: domainEntity.password,
      otpHash: domainEntity.otpHash,
      otpPurpose: domainEntity.otpPurpose,
      otpExpiry: domainEntity.otpExpiry,
      lastOtpAt: domainEntity.lastOtpAt,
      lastLoginAt: domainEntity.lastLoginAt,
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
