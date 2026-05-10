export const SUBSCRIPTION_TIERS = {
  lite: {
    tier: 'lite',
    creditsGranted: 1,
    creditsBonus: 1,
    validityDays: 30,
    bonusValidityDays: 7,
    amountFcfa: 5000,
  },
  essentiel: {
    tier: 'essentiel',
    creditsGranted: 3,
    creditsBonus: 0,
    validityDays: 30,
    bonusValidityDays: 0,
    amountFcfa: 10000,
  },
  trimestriel: {
    tier: 'trimestriel',
    creditsGranted: 10,
    creditsBonus: 0,
    validityDays: 90,
    bonusValidityDays: 0,
    amountFcfa: 25000,
  },
  annuel: {
    tier: 'annuel',
    creditsGranted: 49,
    creditsBonus: 0,
    validityDays: 365,
    bonusValidityDays: 0,
    amountFcfa: 75000,
  },
} as const;

export type SubscriptionTier = keyof typeof SUBSCRIPTION_TIERS;

export const SUBSCRIPTION_STATUS_ACTIVE = 'active';
export const SUBSCRIPTION_STATUS_EXPIRED = 'expired';
export const SUBSCRIPTION_STATUS_CANCELLED = 'cancelled';
