import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma.service';

const TIER_CONFIG = {
  lite: {
    creditsGranted: 1,
    creditsBonus: 1,
    validityDays: 30,
    bonusValidityDays: 7,
    amountFcfa: 5000,
  },
  essentiel: {
    creditsGranted: 3,
    creditsBonus: 0,
    validityDays: 30,
    bonusValidityDays: 0,
    amountFcfa: 10000,
  },
  trimestriel: {
    creditsGranted: 10,
    creditsBonus: 0,
    validityDays: 90,
    bonusValidityDays: 0,
    amountFcfa: 25000,
  },
  annuel: {
    creditsGranted: 49,
    creditsBonus: 0,
    validityDays: 365,
    bonusValidityDays: 0,
    amountFcfa: 75000,
  },
} as const;

type Tier = keyof typeof TIER_CONFIG;

@Injectable()
export class SubscriptionSeedService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Backfills Subscription records for any validated user who does not yet
   * have one. Safe to re-run (idempotent).
   */
  async run() {
    // Find all validated profiles that have a validated payment but no subscription
    const validatedProfiles = await this.prisma.profile.findMany({
      where: { isValidated: true },
      include: {
        user: {
          include: {
            payments: {
              where: { status: 'validated' },
              orderBy: { createdAt: 'asc' },
              take: 1,
            },
            subscriptions: { where: { status: 'active' }, take: 1 },
          },
        },
      },
    });

    for (const profile of validatedProfiles) {
      const user = profile.user;

      // Skip if already has an active subscription
      if (user.subscriptions.length > 0) {
        console.log(
          `[seed:subscription] Already has subscription: ${user.email}`,
        );
        continue;
      }

      const validatedPayment = user.payments[0];
      if (!validatedPayment) {
        console.log(
          `[seed:subscription] No validated payment found for: ${user.email} — skipping`,
        );
        continue;
      }

      // Resolve tier from subscriptionType on profile, or infer from amount
      const tier =
        (profile.subscriptionType as Tier | null) ??
        this.inferTierFromAmount(validatedPayment.amount);
      const config = TIER_CONFIG[tier];

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

      // Count credits already used (from accepted matches)
      const activeMatches = await this.prisma.match.count({
        where: {
          status: 'accepted',
          OR: [{ requesterId: user.id }, { targetId: user.id }],
        },
      });

      await this.prisma.subscription.create({
        data: {
          userId: user.id,
          tier,
          creditsGranted: config.creditsGranted,
          creditsBonus: config.creditsBonus,
          creditsUsed: Math.min(
            activeMatches,
            config.creditsGranted + config.creditsBonus,
          ),
          status: 'active',
          expiresAt,
          bonusExpiresAt,
          paymentId: validatedPayment.id,
        },
      });

      // Sync profile cache
      const totalCredits = config.creditsGranted + config.creditsBonus;
      await this.prisma.profile.update({
        where: { id: profile.id },
        data: {
          subscriptionType: tier,
          matchCreditsTotal: totalCredits,
          matchCreditsUsed: Math.min(activeMatches, totalCredits),
        },
      });

      console.log(
        `[seed:subscription] Created for ${user.email}: tier=${tier}, credits=${config.creditsGranted}+${config.creditsBonus} bonus`,
      );
    }

    console.log('[seed:subscription] Subscription backfill completed.');
  }

  private inferTierFromAmount(amount: number | null | undefined): Tier {
    if (!amount) return 'lite';
    if (amount >= 75000) return 'annuel';
    if (amount >= 25000) return 'trimestriel';
    if (amount >= 10000) return 'essentiel';
    return 'lite';
  }
}
