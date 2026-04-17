import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../../../../database/prisma.service';
import { NullableType } from '../../../../../utils/types/nullable.type';
import { Profile } from '../../../../domain/profile';
import { ProfileRepository } from '../../profile.repository';
import { ProfileMapper } from '../mappers/profile.mapper';

@Injectable()
export class ProfileRelationalRepository implements ProfileRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: Profile): Promise<Profile> {
    const persistenceData = ProfileMapper.toPersistence(data);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { id: _, ...createData } =
      persistenceData as typeof persistenceData & {
        id?: never;
      };

    const entity = await this.prisma.profile.create({
      data: createData as Prisma.ProfileUncheckedCreateInput,
    });
    return ProfileMapper.toDomain(entity);
  }

  async findById(id: Profile['id']): Promise<NullableType<Profile>> {
    const entity = await this.prisma.profile.findUnique({
      where: { id: Number(id) },
    });
    return entity ? ProfileMapper.toDomain(entity) : null;
  }

  async findByUserId(
    userId: Profile['userId'],
  ): Promise<NullableType<Profile>> {
    const entity = await this.prisma.profile.findUnique({
      where: { userId: Number(userId) },
    });
    return entity ? ProfileMapper.toDomain(entity) : null;
  }

  async findAll(filters?: {
    isIdentityVerified?: boolean;
    isComplete?: boolean;
    isValidated?: boolean;
  }): Promise<Profile[]> {
    const where: Record<string, unknown> = {};
    if (filters?.isIdentityVerified !== undefined) {
      where.isIdentityVerified = filters.isIdentityVerified;
    }
    if (filters?.isComplete !== undefined) {
      where.isComplete = filters.isComplete;
    }
    if (filters?.isValidated !== undefined) {
      where.isValidated = filters.isValidated;
    }
    const entities = await this.prisma.profile.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });
    return entities.map((entity) => ProfileMapper.toDomain(entity));
  }

  async count(filters?: {
    isValidated?: boolean;
    isIdentityVerified?: boolean;
    gender?: string;
  }): Promise<number> {
    const where: Record<string, unknown> = {};
    if (filters?.isValidated !== undefined) {
      where.isValidated = filters.isValidated;
    }
    if (filters?.isIdentityVerified !== undefined) {
      where.isIdentityVerified = filters.isIdentityVerified;
    }
    if (filters?.gender !== undefined) {
      where.gender = filters.gender;
    }
    return this.prisma.profile.count({ where });
  }

  async update(id: Profile['id'], payload: Partial<Profile>): Promise<Profile> {
    const existing = await this.prisma.profile.findUnique({
      where: { id: Number(id) },
    });

    if (!existing) {
      throw new Error('Record not found');
    }

    const persistenceData = ProfileMapper.toPersistence({
      ...ProfileMapper.toDomain(existing),
      ...payload,
    });
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { id: _, ...updateData } =
      persistenceData as typeof persistenceData & {
        id?: never;
      };

    const entity = await this.prisma.profile.update({
      where: { id: Number(id) },
      data: updateData,
    });
    return ProfileMapper.toDomain(entity);
  }
}
