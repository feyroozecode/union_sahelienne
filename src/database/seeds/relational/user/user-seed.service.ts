import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma.service';
import bcrypt from 'bcryptjs';
import { RoleEnum } from '../../../../roles/roles.enum';
import { StatusEnum } from '../../../../statuses/statuses.enum';

const hash = async (password: string) => {
  const salt = await bcrypt.genSalt();
  return bcrypt.hash(password, salt);
};

@Injectable()
export class UserSeedService {
  constructor(private readonly prisma: PrismaService) {}

  async run() {
    // ── Admin ────────────────────────────────────────────────────────────
    const adminEmail = 'admin@union-sahelienne.com';
    const adminExists = await this.prisma.user.findFirst({
      where: { email: adminEmail, deletedAt: null },
    });

    let adminId: number | undefined;
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

    // ── Test users ───────────────────────────────────────────────────────
    const testUsers = [
      {
        firstName: 'Amadou',
        lastName: 'Diallo',
        email: 'amadou@test.com',
        gender: 'male',
        age: 32,
        profession: 'Ingénieur',
        maritalStatus: 'Célibataire',
        country: 'Sénégal',
        city: 'Dakar',
        ethnicity: 'Wolof',
        validated: true,
        paymentValidated: true,
      },
      {
        firstName: 'Fatoumata',
        lastName: 'Traoré',
        email: 'fatoumata@test.com',
        gender: 'female',
        age: 27,
        profession: 'Infirmière',
        maritalStatus: 'Célibataire',
        country: 'Mali',
        city: 'Bamako',
        ethnicity: 'Bambara',
        validated: true,
        paymentValidated: true,
      },
      {
        firstName: 'Ibrahim',
        lastName: 'Keita',
        email: 'ibrahim@test.com',
        gender: 'male',
        age: 35,
        profession: 'Comptable',
        maritalStatus: 'Divorcé',
        country: 'Guinée',
        city: 'Conakry',
        ethnicity: 'Peulh',
        validated: true,
        paymentValidated: true,
      },
      {
        firstName: 'Mariam',
        lastName: 'Coulibaly',
        email: 'mariam@test.com',
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
      {
        firstName: 'Ousmane',
        lastName: 'Sanogo',
        email: 'ousmane@test.com',
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
      {
        firstName: 'Aïssata',
        lastName: 'Diarra',
        email: 'aissata@test.com',
        gender: 'female',
        age: 30,
        profession: 'Enseignante',
        maritalStatus: 'Célibataire',
        country: 'Burkina Faso',
        city: 'Ouagadougou',
        ethnicity: 'Mossi',
        validated: true,
        paymentValidated: true,
      },
      {
        firstName: 'Moussa',
        lastName: 'Sidibé',
        email: 'moussa@test.com',
        gender: 'male',
        age: 34,
        profession: 'Médecin',
        maritalStatus: 'Célibataire',
        country: 'Mali',
        city: 'Ségou',
        ethnicity: 'Bambara',
        validated: true,
        paymentValidated: true,
      },
      {
        firstName: 'Kadiatou',
        lastName: 'Bah',
        email: 'kadiatou@test.com',
        gender: 'female',
        age: 26,
        profession: 'Juriste',
        maritalStatus: 'Célibataire',
        country: 'Guinée',
        city: 'Labé',
        ethnicity: 'Peulh',
        validated: true,
        paymentValidated: true,
      },
      {
        firstName: 'Sékou',
        lastName: 'Camara',
        email: 'sekou@test.com',
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
      {
        firstName: 'Boubacar',
        lastName: 'Cissé',
        email: 'boubacar@test.com',
        gender: 'male',
        age: 40,
        profession: 'Entrepreneur',
        maritalStatus: 'Célibataire',
        country: 'Niger',
        city: 'Niamey',
        ethnicity: 'Haoussa',
        validated: true,
        paymentValidated: true,
      },
      {
        firstName: 'Aminata',
        lastName: 'Sylla',
        email: 'aminata@test.com',
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
    ];

    const createdUsers: Array<{
      id: number;
      email: string;
      validated: boolean;
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
        createdUsers.push({
          id: exists.id,
          email: u.email,
          validated: profile?.isValidated ?? false,
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
          password: await hash('Test@2026!'),
          provider: 'email',
          roleId: RoleEnum.user,
          statusId,
        },
      });

      // Create profile (complete if not flagged incomplete)
      if (!u.incomplete && !u.statusInactive) {
        const isComplete = !!(
          u.gender &&
          u.maritalStatus &&
          u.country &&
          u.city
        );
        const isValidated = u.validated && isComplete;
        const termsAcceptedAt = isComplete ? new Date() : null;

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
            isValidated,
            ...(isValidated
              ? {
                  subscriptionType: 'lite',
                  matchCreditsTotal: 3,
                  matchCreditsUsed: 0,
                }
              : {}),
          },
        });

        // Create payment
        if (u.paymentValidated) {
          await this.prisma.payment.create({
            data: {
              userId: user.id,
              type: 'manual',
              status: 'validated',
              validatedAt: new Date(),
              validatedBy: adminId,
              amount: 5000,
            },
          });
        } else if (u.paymentPending) {
          await this.prisma.payment.create({
            data: {
              userId: user.id,
              type: 'manual',
              status: 'pending',
              amount: 5000,
            },
          });
        } else if (u.paymentRejected) {
          await this.prisma.payment.create({
            data: {
              userId: user.id,
              type: 'manual',
              status: 'rejected',
              amount: 5000,
            },
          });
        }

        createdUsers.push({
          id: user.id,
          email: u.email,
          validated: isValidated,
        });
      } else {
        // Incomplete profile (just gender set)
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

    // ── Matches ──────────────────────────────────────────────────────────
    // Amadou (#0, male, validated) ↔ Fatoumata (#1, female, validated)
    // Moussa (#6, male, validated) ↔ Aïssata (#5, female, validated)
    // Kadiatou (#7, female, validated) ↔ Boubacar (#10, male, validated)

    const matchPairs: Array<[number, number]> = [
      [0, 1], // Amadou ↔ Fatoumata
      [6, 5], // Moussa ↔ Aïssata
      [10, 7], // Boubacar ↔ Kadiatou
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

        // Update matchCreditsUsed for both
        await this.prisma.profile.updateMany({
          where: { userId: { in: [requester.id, target.id] } },
          data: { matchCreditsUsed: { increment: 1 } },
        });

        console.log(
          `[seed] Match created: ${requester.email} ↔ ${target.email}`,
        );
      }
    }

    console.log('[seed] Relational seed completed.');
  }
}
