import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../../database/prisma.service';
import { SessionRepository } from '../../session.repository';
import { SessionMapper } from '../mappers/session.mapper';
import { Session } from '../../../../domain/session';
import { NullableType } from '../../../../../utils/types/nullable.type';
import { User } from '../../../../../users/domain/user';

const SESSION_INCLUDE = {
  user: { include: { photo: true, role: true, status: true } },
} as const;

@Injectable()
export class SessionRelationalRepository implements SessionRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: Session['id']): Promise<NullableType<Session>> {
    const entity = await this.prisma.session.findFirst({
      where: { id: Number(id), deletedAt: null },
      include: SESSION_INCLUDE,
    });
    return entity ? SessionMapper.toDomain(entity) : null;
  }

  async create(data: Session): Promise<Session> {
    const entity = await this.prisma.session.create({
      data: SessionMapper.toPersistence(data),
      include: SESSION_INCLUDE,
    });
    return SessionMapper.toDomain(entity);
  }

  async update(
    id: Session['id'],
    payload: Partial<
      Omit<Session, 'id' | 'createdAt' | 'updatedAt' | 'deletedAt'>
    >,
  ): Promise<Session | null> {
    const existing = await this.prisma.session.findFirst({
      where: { id: Number(id), deletedAt: null },
      include: SESSION_INCLUDE,
    });
    if (!existing) throw new Error('Session not found');

    const merged = { ...SessionMapper.toDomain(existing), ...payload };
    const persistenceData = SessionMapper.toPersistence(merged);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { id: _, ...updateData } = {
      ...persistenceData,
    } as typeof persistenceData & { id: never };

    const entity = await this.prisma.session.update({
      where: { id: Number(id) },
      data: updateData,
      include: SESSION_INCLUDE,
    });
    return SessionMapper.toDomain(entity);
  }

  async deleteById(id: Session['id']): Promise<void> {
    await this.prisma.session.update({
      where: { id: Number(id) },
      data: { deletedAt: new Date() },
    });
  }

  async deleteByUserId(conditions: { userId: User['id'] }): Promise<void> {
    await this.prisma.session.updateMany({
      where: { userId: Number(conditions.userId), deletedAt: null },
      data: { deletedAt: new Date() },
    });
  }

  async deleteByUserIdWithExclude(conditions: {
    userId: User['id'];
    excludeSessionId: Session['id'];
  }): Promise<void> {
    await this.prisma.session.updateMany({
      where: {
        userId: Number(conditions.userId),
        id: { not: Number(conditions.excludeSessionId) },
        deletedAt: null,
      },
      data: { deletedAt: new Date() },
    });
  }
}
