import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../../../../database/prisma.service';
import { NullableType } from '../../../../../utils/types/nullable.type';
import { Match } from '../../../../domain/match';
import { MatchRepository } from '../../match.repository';
import { MatchMapper, MatchWithRelations } from '../mappers/match.mapper';

const MATCH_INCLUDE = {
  requester: {
    include: {
      photo: true,
      role: true,
      status: true,
      profile: true,
    },
  },
  target: {
    include: {
      photo: true,
      role: true,
      status: true,
      profile: true,
    },
  },
} as const;

@Injectable()
export class MatchRelationalRepository implements MatchRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: Match): Promise<Match> {
    const persistenceData = MatchMapper.toPersistence(data);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { id: _, ...createData } =
      persistenceData as typeof persistenceData & {
        id?: never;
      };

    const entity = await this.prisma.match.create({
      data: createData as Prisma.MatchUncheckedCreateInput,
      include: MATCH_INCLUDE,
    });
    return MatchMapper.toDomain(entity as MatchWithRelations);
  }

  async findById(id: Match['id']): Promise<NullableType<Match>> {
    const entity = await this.prisma.match.findUnique({
      where: { id: Number(id) },
      include: MATCH_INCLUDE,
    });
    return entity ? MatchMapper.toDomain(entity) : null;
  }

  async findBetweenUsers(
    firstUserId: number,
    secondUserId: number,
  ): Promise<NullableType<Match>> {
    const pairKey = [firstUserId, secondUserId]
      .sort((left, right) => left - right)
      .join(':');
    const entity = await this.prisma.match.findUnique({
      where: { pairKey },
      include: MATCH_INCLUDE,
    });
    return entity ? MatchMapper.toDomain(entity) : null;
  }

  async countActiveByUserId(userId: number): Promise<number> {
    return this.prisma.match.count({
      where: {
        status: 'accepted',
        OR: [{ requesterId: Number(userId) }, { targetId: Number(userId) }],
      },
    });
  }

  async findByUserId(userId: number): Promise<Match[]> {
    const entities = await this.prisma.match.findMany({
      where: {
        OR: [{ requesterId: Number(userId) }, { targetId: Number(userId) }],
      },
      include: MATCH_INCLUDE,
      orderBy: { createdAt: 'desc' },
    });
    return entities.map((entity) => MatchMapper.toDomain(entity));
  }

  async update(id: Match['id'], payload: Partial<Match>): Promise<Match> {
    const existing = await this.prisma.match.findUnique({
      where: { id: Number(id) },
      include: MATCH_INCLUDE,
    });

    if (!existing) {
      throw new Error('Record not found');
    }

    const persistenceData = MatchMapper.toPersistence({
      ...MatchMapper.toDomain(existing),
      ...payload,
    });
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { id: _, ...updateData } =
      persistenceData as typeof persistenceData & {
        id?: never;
      };

    const entity = await this.prisma.match.update({
      where: { id: Number(id) },
      data: updateData,
      include: MATCH_INCLUDE,
    });

    return MatchMapper.toDomain(entity);
  }
}
