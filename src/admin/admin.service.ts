import { Injectable, NotFoundException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { PaymentRepository } from '../payments/infrastructure/persistence/payment.repository';
import { ProfileRepository } from '../profiles/infrastructure/persistence/profile.repository';
import { MatchRepository } from '../matches/infrastructure/persistence/match.repository';
import { PrismaService } from '../database/prisma.service';
import { QueryUserDto } from '../users/dto/query-user.dto';

@Injectable()
export class AdminService {
  constructor(
    private readonly usersService: UsersService,
    private readonly paymentRepository: PaymentRepository,
    private readonly profileRepository: ProfileRepository,
    private readonly matchRepository: MatchRepository,
    private readonly prisma: PrismaService,
  ) {}

  async getDashboard() {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const [
      totalUsers,
      totalMaleUsers,
      totalFemaleUsers,
      pendingPaymentsCount,
      validatedPaymentsCount,
      validatedProfiles,
      unverifiedIdentities,
      activeMatches,
      pendingMatches,
      totalMatches,
      recentRegistrations,
    ] = await Promise.all([
      this.prisma.user.count({ where: { deletedAt: null } }),
      this.profileRepository.count({ gender: 'male' }),
      this.profileRepository.count({ gender: 'female' }),
      this.paymentRepository.countByStatus('pending'),
      this.paymentRepository.countByStatus('validated'),
      this.profileRepository.count({ isValidated: true }),
      this.profileRepository.count({ isIdentityVerified: false }),
      this.matchRepository.countByStatus('accepted'),
      this.matchRepository.countByStatus('pending'),
      this.prisma.match.count(),
      this.prisma.$queryRaw<Array<{ date: string; count: bigint }>>`
        SELECT DATE("createdAt") as date, COUNT(*)::int as count
        FROM "user"
        WHERE "createdAt" >= ${thirtyDaysAgo}
          AND "deletedAt" IS NULL
        GROUP BY DATE("createdAt")
        ORDER BY date ASC
      `,
    ]);

    return {
      kpis: {
        totalUsers,
        totalMaleUsers,
        totalFemaleUsers,
        pendingPaymentsCount,
        validatedPaymentsCount,
        validatedProfiles,
        unverifiedIdentities,
        totalMatches,
        activeMatches,
        pendingMatches,
      },
      recentRegistrations: recentRegistrations.map((row) => ({
        date: String(row.date),
        count: Number(row.count),
      })),
    };
  }

  async getStats() {
    const pendingPayments = await this.paymentRepository.findPending();
    return {
      pendingPaymentsCount: pendingPayments.length,
    };
  }

  getPendingPayments() {
    return this.paymentRepository.findPending();
  }

  getAllPayments() {
    return this.paymentRepository.findAll();
  }

  getProfiles(filters?: {
    isIdentityVerified?: boolean;
    isComplete?: boolean;
    isValidated?: boolean;
  }) {
    return this.profileRepository.findAll(filters);
  }

  getMatches(filters?: { status?: string }) {
    return this.matchRepository.findAll(filters);
  }

  getUsers(query: QueryUserDto) {
    const page = query?.page ?? 1;
    const limit = Math.min(query?.limit ?? 20, 100);
    return this.usersService.findManyWithPagination({
      filterOptions: query.filters ?? null,
      sortOptions: query.sort ?? null,
      paginationOptions: { page, limit },
    });
  }

  async verifyIdentity(profileId: number) {
    const profile = await this.profileRepository.findById(profileId);

    if (!profile) {
      throw new NotFoundException({
        status: 404,
        error: 'profileNotFound',
      });
    }

    return this.profileRepository.update(profileId, {
      isIdentityVerified: true,
    });
  }
}
