import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma.service';
import bcrypt from 'bcryptjs';
import { RoleEnum } from '../../../../roles/roles.enum';
import { StatusEnum } from '../../../../statuses/statuses.enum';

const hash = async (password: string) => {
  const salt = await bcrypt.genSalt();
  return bcrypt.hash(password, salt);
};

// Subscription tier definitions matching subscriptions.constants.ts
const TIERS = {
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

type Tier = keyof typeof TIERS;

interface TestUser {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  gender: string;
  age?: number;
  profession?: string | null;
  maritalStatus?: string | null;
  country?: string | null;
  city?: string | null;
  ethnicity?: string | null;
  validated?: boolean;
  paymentValidated?: boolean;
  paymentPending?: boolean;
  paymentRejected?: boolean;
  incomplete?: boolean;
  statusInactive?: boolean;
  tier?: Tier;
  creditsUsed?: number;
  // R3: subscription data
  subscriptionTier?: Tier;
  // Waitlist: paid but held until the gender ratio allows activation
  waitlist?: boolean;
  waitlistDaysAgo?: number;
}

@Injectable()
export class UserSeedService {
  constructor(private readonly prisma: PrismaService) {}

  async run() {
    // ── Admin ────────────────────────────────────────────────────────────────
    const adminEmail = 'admin@union-sahelienne.com';
    const adminExists = await this.prisma.user.findFirst({
      where: { email: adminEmail, deletedAt: null },
    });

    let adminId: number;
    if (!adminExists) {
      const admin = await this.prisma.user.create({
        data: {
          firstName: 'Administrateur',
          lastName: 'Système',
          email: adminEmail,
          password: await hash('Admin@2026!'),
          provider: 'email',
          roleId: RoleEnum.admin,
          statusId: StatusEnum.active,
        },
      });
      adminId = admin.id;
      console.log(`[seed] Admin created: ${adminEmail} / Admin@2026!`);
    } else {
      adminId = adminExists.id;
      console.log(`[seed] Admin already exists: ${adminEmail}`);
    }

    // ── Test users ───────────────────────────────────────────────────────────
    //
    // State legend:
    //  validated + paymentValidated → profile complete, subscription active
    //  paymentPending               → payment submitted, awaiting admin validation
    //  paymentRejected              → payment rejected, not validated
    //  incomplete                   → profile not complete (some fields missing)
    //  statusInactive               → user account inactive
    //
    const testUsers: TestUser[] = [
      // ── Validated users (complete profile + active subscription) ──────────
      {
        firstName: 'Amadou',
        lastName: 'Diallo',
        email: 'amadou@test.com',
        phone: '+221770000001',
        gender: 'male',
        age: 32,
        profession: 'Ingénieur',
        maritalStatus: 'Célibataire',
        country: 'Sénégal',
        city: 'Dakar',
        ethnicity: 'Wolof',
        validated: true,
        paymentValidated: true,
        subscriptionTier: 'lite',
      },
      {
        firstName: 'Fatoumata',
        lastName: 'Traoré',
        email: 'fatoumata@test.com',
        phone: '+223700000002',
        gender: 'female',
        age: 27,
        profession: 'Infirmière',
        maritalStatus: 'Célibataire',
        country: 'Mali',
        city: 'Bamako',
        ethnicity: 'Bambara',
        validated: true,
        paymentValidated: true,
        subscriptionTier: 'lite',
      },
      {
        firstName: 'Ibrahim',
        lastName: 'Keita',
        email: 'ibrahim@test.com',
        phone: '+224620000003',
        gender: 'male',
        age: 35,
        profession: 'Comptable',
        maritalStatus: 'Divorcé',
        country: 'Guinée',
        city: 'Conakry',
        ethnicity: 'Peulh',
        validated: true,
        paymentValidated: true,
        subscriptionTier: 'essentiel',
        creditsUsed: 0,
      },
      {
        firstName: 'Aïssata',
        lastName: 'Diarra',
        email: 'aissata@test.com',
        phone: '+226700000006',
        gender: 'female',
        age: 30,
        profession: 'Enseignante',
        maritalStatus: 'Célibataire',
        country: 'Burkina Faso',
        city: 'Ouagadougou',
        ethnicity: 'Mossi',
        validated: true,
        paymentValidated: true,
        subscriptionTier: 'lite',
      },
      {
        firstName: 'Moussa',
        lastName: 'Sidibé',
        email: 'moussa@test.com',
        phone: '+223700000007',
        gender: 'male',
        age: 34,
        profession: 'Médecin',
        maritalStatus: 'Célibataire',
        country: 'Mali',
        city: 'Ségou',
        ethnicity: 'Bambara',
        validated: true,
        paymentValidated: true,
        subscriptionTier: 'trimestriel',
      },
      {
        firstName: 'Kadiatou',
        lastName: 'Bah',
        email: 'kadiatou@test.com',
        phone: '+224620000008',
        gender: 'female',
        age: 26,
        profession: 'Juriste',
        maritalStatus: 'Célibataire',
        country: 'Guinée',
        city: 'Labé',
        ethnicity: 'Peulh',
        validated: true,
        paymentValidated: true,
        subscriptionTier: 'lite',
      },
      {
        firstName: 'Boubacar',
        lastName: 'Cissé',
        email: 'boubacar@test.com',
        phone: '+227900000011',
        gender: 'male',
        age: 40,
        profession: 'Entrepreneur',
        maritalStatus: 'Célibataire',
        country: 'Niger',
        city: 'Niamey',
        ethnicity: 'Haoussa',
        validated: true,
        paymentValidated: true,
        subscriptionTier: 'annuel',
      },
      // ── Payment pending (complete profile, awaiting admin validation) ──────
      {
        firstName: 'Mariam',
        lastName: 'Coulibaly',
        email: 'mariam@test.com',
        phone: '+22500000004',
        gender: 'female',
        age: 24,
        profession: 'Étudiante',
        maritalStatus: 'Célibataire',
        country: "Côte d'Ivoire",
        city: 'Abidjan',
        ethnicity: 'Dioula',
        validated: false,
        paymentValidated: false,
        paymentPending: true,
      },
      // ── Payment rejected (complete profile, payment rejected) ─────────────
      {
        firstName: 'Sékou',
        lastName: 'Camara',
        email: 'sekou@test.com',
        phone: '+221770000009',
        gender: 'male',
        age: 38,
        profession: 'Architecte',
        maritalStatus: 'Divorcé',
        country: 'Sénégal',
        city: 'Thiès',
        ethnicity: 'Sérère',
        validated: false,
        paymentValidated: false,
        paymentRejected: true,
      },
      // ── Incomplete profile (missing required fields) ───────────────────────
      {
        firstName: 'Ousmane',
        lastName: 'Sanogo',
        email: 'ousmane@test.com',
        phone: '+221770000005',
        gender: 'male',
        age: 29,
        profession: 'Commerçant',
        maritalStatus: null,
        country: null,
        city: null,
        ethnicity: null,
        validated: false,
        paymentValidated: false,
        incomplete: true,
      },
      // ── No profile yet (inactive account) ────────────────────────────────
      {
        firstName: 'Djénéba',
        lastName: 'Koné',
        email: 'djeneba@test.com',
        gender: 'female',
        age: 22,
        profession: null,
        maritalStatus: null,
        country: null,
        city: null,
        ethnicity: null,
        validated: false,
        paymentValidated: false,
        statusInactive: true,
      },
      // ── No subscription yet (complete profile, no payment) ────────────────
      {
        firstName: 'Aminata',
        lastName: 'Sylla',
        email: 'aminata@test.com',
        phone: '+224620000012',
        gender: 'female',
        age: 25,
        profession: 'Pharmacienne',
        maritalStatus: 'Célibataire',
        country: 'Guinée',
        city: 'Kindia',
        ethnicity: 'Soussou',
        validated: false,
        paymentValidated: false,
      },
      // ── Waitlisted (payment validated but gender ratio blocked them) ─────
      {
        firstName: 'Mariam',
        lastName: 'Touré',
        email: 'mariam.w@test.com',
        phone: '+223700000020',
        gender: 'female',
        age: 28,
        profession: 'Comptable',
        maritalStatus: 'Célibataire',
        country: 'Mali',
        city: 'Sikasso',
        validated: false,
        paymentValidated: true,
        subscriptionTier: 'lite',
        waitlist: true,
        waitlistDaysAgo: 5,
      },
      {
        firstName: 'Souleymane',
        lastName: 'Maïga',
        email: 'souleymane.w@test.com',
        phone: '+223700000021',
        gender: 'male',
        age: 31,
        profession: 'Agronome',
        maritalStatus: 'Célibataire',
        country: 'Mali',
        city: 'Mopti',
        validated: false,
        paymentValidated: true,
        subscriptionTier: 'lite',
        waitlist: true,
        waitlistDaysAgo: 1,
      },
    ];

    // Track created/existing users for match seeding (index = position in testUsers array)
    const createdUsers: Array<{
      id: number;
      email: string;
      validated: boolean;
      paymentId?: number;
    }> = [];

    for (const u of testUsers) {
      const exists = await this.prisma.user.findFirst({
        where: { email: u.email, deletedAt: null },
      });

      if (exists) {
        console.log(`[seed] User already exists: ${u.email}`);
        const profile = await this.prisma.profile.findUnique({
          where: { userId: exists.id },
        });
        const payment = await this.prisma.payment.findFirst({
          where: { userId: exists.id, status: 'validated' },
        });
        createdUsers.push({
          id: exists.id,
          email: u.email,
          validated: profile?.isValidated ?? false,
          paymentId: payment?.id,
        });
        continue;
      }

      const statusId = u.statusInactive
        ? StatusEnum.inactive
        : StatusEnum.active;

      const user = await this.prisma.user.create({
        data: {
          firstName: u.firstName,
          lastName: u.lastName,
          email: u.email,
          phone: u.phone ?? null,
          password: await hash('Test@2026!'),
          provider: 'email',
          roleId: RoleEnum.user,
          statusId,
        },
      });

      let paymentId: number | undefined;

      if (!u.incomplete && !u.statusInactive) {
        const isComplete = !!(
          u.gender &&
          u.maritalStatus &&
          u.country &&
          u.city
        );
        const isValidated = !!(u.validated && isComplete);
        const termsAcceptedAt = isComplete ? new Date() : null;

        const tier = u.subscriptionTier ?? 'lite';
        const tierConfig = TIERS[tier];
        const totalCredits =
          tierConfig.creditsGranted + tierConfig.creditsBonus;

        // Waitlist users: payment was validated but profile held inactive
        const isWaitlisted = !!u.waitlist;
        const effectiveValidated = isWaitlisted ? false : isValidated;

        await this.prisma.profile.create({
          data: {
            userId: user.id,
            gender: u.gender,
            age: u.age ?? undefined,
            profession: u.profession ?? undefined,
            maritalStatus: u.maritalStatus ?? undefined,
            country: u.country ?? undefined,
            city: u.city ?? undefined,
            ethnicity: u.ethnicity ?? undefined,
            termsAcceptedAt,
            isComplete,
            isValidated: effectiveValidated,
            ...(isValidated
              ? {
                  subscriptionType: tier,
                  matchCreditsTotal: totalCredits,
                  matchCreditsUsed: u.creditsUsed ?? 0,
                }
              : {}),
          },
        });

        if (isWaitlisted) {
          const daysAgo = u.waitlistDaysAgo ?? 0;
          const waitlistedAt = new Date(
            Date.now() - daysAgo * 24 * 60 * 60 * 1000,
          );
          await this.prisma.user.update({
            where: { id: user.id },
            data: {
              waitlistReason: 'gender_balance',
              waitlistedAt,
            },
          });
        }

        // ── Payment record ─────────────────────────────────────────────────
        if (u.paymentValidated) {
          const payment = await this.prisma.payment.create({
            data: {
              userId: user.id,
              type: 'manual',
              status: 'validated',
              validatedAt: new Date(),
              validatedBy: adminId,
              amount: tierConfig.amountFcfa,
            },
          });
          paymentId = payment.id;

          // ── Subscription record (R3) ───────────────────────────────────
          const now = new Date();
          const expiresAt = new Date(
            now.getTime() + tierConfig.validityDays * 24 * 60 * 60 * 1000,
          );
          const bonusExpiresAt =
            tierConfig.bonusValidityDays > 0
              ? new Date(
                  now.getTime() +
                    tierConfig.bonusValidityDays * 24 * 60 * 60 * 1000,
                )
              : null;

          await this.prisma.subscription.create({
            data: {
              userId: user.id,
              tier,
              creditsGranted: tierConfig.creditsGranted,
              creditsBonus: tierConfig.creditsBonus,
              creditsUsed: u.creditsUsed ?? 0,
              status: 'active',
              expiresAt,
              bonusExpiresAt,
              paymentId: payment.id,
            },
          });

          console.log(
            `[seed] Subscription created: ${u.email} → ${tier} (${totalCredits} credits)`,
          );
        } else if (u.paymentPending) {
          await this.prisma.payment.create({
            data: {
              userId: user.id,
              type: 'manual',
              status: 'pending',
              amount: TIERS.lite.amountFcfa,
            },
          });
        } else if (u.paymentRejected) {
          await this.prisma.payment.create({
            data: {
              userId: user.id,
              type: 'manual',
              status: 'rejected',
              amount: TIERS.lite.amountFcfa,
            },
          });
        }

        createdUsers.push({
          id: user.id,
          email: u.email,
          validated: isValidated,
          paymentId,
        });
      } else {
        // Incomplete or inactive: minimal profile
        if (!u.statusInactive) {
          await this.prisma.profile.create({
            data: {
              userId: user.id,
              gender: u.gender,
              isComplete: false,
              isValidated: false,
            },
          });
        }
        createdUsers.push({ id: user.id, email: u.email, validated: false });
      }

      console.log(`[seed] User created: ${u.email} / Test@2026!`);
    }

    // ── Matches ──────────────────────────────────────────────────────────────
    // Index references into createdUsers (same order as testUsers array):
    //   0 Amadou (male, validated, lite)
    //   1 Fatoumata (female, validated, lite)
    //   2 Ibrahim (male, validated, essentiel)
    //   3 Aïssata (female, validated, lite)
    //   4 Moussa (male, validated, trimestriel)
    //   5 Kadiatou (female, validated, lite)
    //   6 Boubacar (male, validated, annuel)

    const matchPairs: Array<[number, number]> = [
      [0, 1], // Amadou ↔ Fatoumata
      [4, 3], // Moussa ↔ Aïssata
      [6, 5], // Boubacar ↔ Kadiatou
    ];

    for (const [reqIdx, tgtIdx] of matchPairs) {
      const requester = createdUsers[reqIdx];
      const target = createdUsers[tgtIdx];

      if (!requester || !target) continue;
      if (!requester.validated || !target.validated) continue;

      const pairKey = [requester.id, target.id].sort((a, b) => a - b).join(':');

      const existingMatch = await this.prisma.match.findUnique({
        where: { pairKey },
      });

      if (!existingMatch) {
        const now = new Date();
        const chatExpiresAt = new Date(
          now.getTime() + 30 * 24 * 60 * 60 * 1000,
        );

        await this.prisma.match.create({
          data: {
            requesterId: requester.id,
            targetId: target.id,
            pairKey,
            status: 'accepted',
            chatOpenedAt: now,
            chatExpiresAt,
          },
        });

        // Sync creditsUsed on both subscriptions
        await this.prisma.subscription.updateMany({
          where: {
            userId: { in: [requester.id, target.id] },
            status: 'active',
          },
          data: { creditsUsed: { increment: 1 } },
        });
        // Sync profile credits cache
        await this.prisma.profile.updateMany({
          where: { userId: { in: [requester.id, target.id] } },
          data: { matchCreditsUsed: { increment: 1 } },
        });

        console.log(
          `[seed] Match created: ${requester.email} ↔ ${target.email}`,
        );
      }
    }

    // ── Sample messages in first match ───────────────────────────────────────
    const firstMatch = await this.prisma.match.findFirst({
      where: { status: 'accepted' },
      orderBy: { createdAt: 'asc' },
    });

    if (firstMatch) {
      const existingMessages = await this.prisma.message.count({
        where: { matchId: firstMatch.id },
      });

      if (existingMessages === 0) {
        const sampleMessages = [
          {
            senderId: firstMatch.requesterId,
            content: 'Assalamu Alaikum, comment allez-vous ?',
          },
          {
            senderId: firstMatch.targetId,
            content:
              'Wa Alaikum Assalam ! Je vais bien, Alhamdulillah. Et vous ?',
          },
          {
            senderId: firstMatch.requesterId,
            content:
              'Très bien merci. Je suis heureux de vous avoir trouvé sur cette plateforme.',
          },
          {
            senderId: firstMatch.targetId,
            content:
              'Moi aussi. Je suis enseignante à Ouagadougou. Et vous, quelle est votre activité ?',
          },
          {
            senderId: firstMatch.requesterId,
            content:
              "Je suis médecin à Ségou. J'espère qu'on pourra mieux se connaître.",
          },
        ];

        for (const msg of sampleMessages) {
          await this.prisma.message.create({
            data: {
              matchId: firstMatch.id,
              senderId: msg.senderId,
              content: msg.content,
            },
          });
        }
        console.log(
          `[seed] Sample messages created in match #${firstMatch.id}`,
        );
      }
    }

    console.log('\n[seed] ─────────────────────────────────────────────────');
    console.log('[seed]  Relational seed completed.');
    console.log('[seed] ─────────────────────────────────────────────────');
    console.log('[seed]  Admin:   admin@union-sahelienne.com / Admin@2026!');
    console.log('[seed]  Users:   *@test.com / Test@2026!');
    console.log('[seed] ─────────────────────────────────────────────────\n');
  }
}
