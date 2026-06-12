import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../../database/prisma.service';
import { NullableType } from '../../../../../utils/types/nullable.type';
import { Subscription } from '../../../../domain/subscription';
import { SubscriptionRepository } from '../../subscription.repository';
import { SubscriptionMapper } from '../mappers/subscription.mapper';
import { SUBSCRIPTION_STATUS_ACTIVE } from '../../../../subscriptions.constants';

@Injectable()
export class SubscriptionRelationalRepository
  implements SubscriptionRepository
{
  constructor(private readonly prisma: PrismaService) {}

  async create(
    data: Omit<Subscription, 'id' | 'createdAt' | 'updatedAt'>,
  ): Promise<Subscription> {
    const entity = await this.prisma.subscription.create({
      data: {
        userId: data.userId,
        tier: data.tier,
        creditsGranted: data.creditsGranted,
        creditsBonus: data.creditsBonus,
        creditsUsed: data.creditsUsed,
        status: data.status,
        expiresAt: data.expiresAt ?? null,
        bonusExpiresAt: data.bonusExpiresAt ?? null,
        paymentId: data.paymentId ?? null,
      },
    });
    return SubscriptionMapper.toDomain(entity);
  }

  async findById(id: number): Promise<NullableType<Subscription>> {
    const entity = await this.prisma.subscription.findUnique({ where: { id } });
    return entity ? SubscriptionMapper.toDomain(entity) : null;
  }

  async findActiveByUserId(
    userId: number,
  ): Promise<NullableType<Subscription>> {
    const entity = await this.prisma.subscription.findFirst({
      where: {
        userId,
        status: SUBSCRIPTION_STATUS_ACTIVE,
      },
      orderBy: { createdAt: 'desc' },
    });
    return entity ? SubscriptionMapper.toDomain(entity) : null;
  }

  async findByUserId(userId: number): Promise<Subscription[]> {
    const entities = await this.prisma.subscription.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
    return entities.map(SubscriptionMapper.toDomain);
  }

  async findAll(filters?: {
    tier?: string;
    status?: string;
  }): Promise<Subscription[]> {
    const where: Record<string, unknown> = {};
    if (filters?.tier) where.tier = filters.tier;
    if (filters?.status) where.status = filters.status;
    const entities = await this.prisma.subscription.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });
    return entities.map(SubscriptionMapper.toDomain);
  }

  async update(
    id: number,
    payload: Partial<Subscription>,
  ): Promise<Subscription | null> {
    const existing = await this.prisma.subscription.findUnique({
      where: { id },
    });
    if (!existing) return null;

    const updateData = SubscriptionMapper.toPersistence(payload);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { id: _id, ...safeData } = updateData as {
      id?: number;
    } & typeof updateData;

    const entity = await this.prisma.subscription.update({
      where: { id },
      data: safeData,
    });
    return SubscriptionMapper.toDomain(entity);
  }
}
