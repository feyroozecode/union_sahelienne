import { Subscription as PrismaSubscription } from '@prisma/client';
import { Subscription } from '../../../../domain/subscription';

export class SubscriptionMapper {
  static toDomain(raw: PrismaSubscription): Subscription {
    const domain = new Subscription();
    domain.id = raw.id;
    domain.userId = raw.userId;
    domain.tier = raw.tier;
    domain.creditsGranted = raw.creditsGranted;
    domain.creditsBonus = raw.creditsBonus;
    domain.creditsUsed = raw.creditsUsed;
    domain.status = raw.status;
    domain.expiresAt = raw.expiresAt;
    domain.bonusExpiresAt = raw.bonusExpiresAt;
    domain.paymentId = raw.paymentId;
    domain.createdAt = raw.createdAt;
    domain.updatedAt = raw.updatedAt;
    return domain;
  }

  static toPersistence(
    domain: Partial<Subscription>,
  ): Partial<PrismaSubscription> {
    return {
      ...(domain.id !== undefined ? { id: domain.id } : {}),
      ...(domain.userId !== undefined ? { userId: domain.userId } : {}),
      ...(domain.tier !== undefined ? { tier: domain.tier } : {}),
      ...(domain.creditsGranted !== undefined
        ? { creditsGranted: domain.creditsGranted }
        : {}),
      ...(domain.creditsBonus !== undefined
        ? { creditsBonus: domain.creditsBonus }
        : {}),
      ...(domain.creditsUsed !== undefined
        ? { creditsUsed: domain.creditsUsed }
        : {}),
      ...(domain.status !== undefined ? { status: domain.status } : {}),
      ...(domain.expiresAt !== undefined
        ? { expiresAt: domain.expiresAt }
        : {}),
      ...(domain.bonusExpiresAt !== undefined
        ? { bonusExpiresAt: domain.bonusExpiresAt }
        : {}),
      ...(domain.paymentId !== undefined
        ? { paymentId: domain.paymentId }
        : {}),
      ...(domain.createdAt !== undefined
        ? { createdAt: domain.createdAt }
        : {}),
      ...(domain.updatedAt !== undefined
        ? { updatedAt: domain.updatedAt }
        : {}),
    };
  }
}
