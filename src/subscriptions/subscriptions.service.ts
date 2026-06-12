import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { SubscriptionRepository } from './infrastructure/persistence/subscription.repository';
import { Subscription } from './domain/subscription';
import {
  SUBSCRIPTION_TIERS,
  SubscriptionTier,
  SUBSCRIPTION_STATUS_ACTIVE,
  SUBSCRIPTION_STATUS_EXPIRED,
} from './subscriptions.constants';

@Injectable()
export class SubscriptionsService {
  constructor(
    private readonly subscriptionRepository: SubscriptionRepository,
  ) {}

  /**
   * Creates a new subscription for a user after payment validation.
   * Called by PaymentsService on validatePayment.
   */
  async createFromPayment(
    userId: number,
    tier: string,
    paymentId: number,
  ): Promise<Subscription> {
    const tierKey = tier as SubscriptionTier;
    const config = SUBSCRIPTION_TIERS[tierKey];

    if (!config) {
      throw new BadRequestException({
        status: 400,
        errors: { tier: `unknownSubscriptionTier: ${tier}` },
      });
    }

    const now = new Date();

    const expiresAt = new Date(
      now.getTime() + config.validityDays * 24 * 60 * 60 * 1000,
    );

    const bonusExpiresAt =
      config.bonusValidityDays > 0
        ? new Date(
            now.getTime() + config.bonusValidityDays * 24 * 60 * 60 * 1000,
          )
        : null;

    // Expire any existing active subscription
    const existing =
      await this.subscriptionRepository.findActiveByUserId(userId);
    if (existing) {
      await this.subscriptionRepository.update(existing.id, {
        status: SUBSCRIPTION_STATUS_EXPIRED,
      });
    }

    return this.subscriptionRepository.create({
      userId,
      tier: config.tier,
      creditsGranted: config.creditsGranted,
      creditsBonus: config.creditsBonus,
      creditsUsed: 0,
      status: SUBSCRIPTION_STATUS_ACTIVE,
      expiresAt,
      bonusExpiresAt,
      paymentId,
    });
  }

  /**
   * Returns the active subscription for a user, or null.
   */
  findActiveByUserId(userId: number): Promise<Subscription | null> {
    return this.subscriptionRepository.findActiveByUserId(userId);
  }

  /**
   * Returns all subscriptions for a user (history).
   */
  findMySubscriptions(userId: number): Promise<Subscription[]> {
    return this.subscriptionRepository.findByUserId(userId);
  }

  /**
   * Returns available credits for a user's active subscription.
   * Bonus credits count only while bonusExpiresAt is in the future.
   */
  async getAvailableCredits(userId: number): Promise<number> {
    const sub = await this.subscriptionRepository.findActiveByUserId(userId);
    if (!sub) return 0;

    const now = new Date();

    // Check if subscription itself is expired
    if (sub.expiresAt && sub.expiresAt < now) {
      await this.subscriptionRepository.update(sub.id, {
        status: SUBSCRIPTION_STATUS_EXPIRED,
      });
      return 0;
    }

    const bonusActive = sub.bonusExpiresAt && sub.bonusExpiresAt > now;
    const totalGranted =
      sub.creditsGranted + (bonusActive ? sub.creditsBonus : 0);
    return Math.max(0, totalGranted - sub.creditsUsed);
  }

  /**
   * Deducts one credit from the user's active subscription.
   * Throws if no credits available.
   */
  async deductCredit(userId: number): Promise<Subscription> {
    const available = await this.getAvailableCredits(userId);
    if (available <= 0) {
      throw new BadRequestException({
        status: 400,
        errors: { credits: 'noCreditsAvailable' },
      });
    }

    const sub = await this.subscriptionRepository.findActiveByUserId(userId);
    if (!sub) {
      throw new NotFoundException({
        status: 404,
        error: 'subscriptionNotFound',
      });
    }

    const updated = await this.subscriptionRepository.update(sub.id, {
      creditsUsed: sub.creditsUsed + 1,
    });

    if (!updated) {
      throw new NotFoundException({
        status: 404,
        error: 'subscriptionNotFound',
      });
    }

    return updated;
  }

  /**
   * Admin: list all subscriptions with optional filters.
   */
  findAll(filters?: {
    tier?: string;
    status?: string;
  }): Promise<Subscription[]> {
    return this.subscriptionRepository.findAll(filters);
  }
}
