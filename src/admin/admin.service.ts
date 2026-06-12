import {
  BadRequestException,
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { PaymentRepository } from '../payments/infrastructure/persistence/payment.repository';
import { ProfileRepository } from '../profiles/infrastructure/persistence/profile.repository';
import { MatchRepository } from '../matches/infrastructure/persistence/match.repository';
import { PrismaService } from '../database/prisma.service';
import { QueryUserDto } from '../users/dto/query-user.dto';
import { User } from '../users/domain/user';
import { ReportsService } from '../reports/reports.service';
import { SubscriptionRepository } from '../subscriptions/infrastructure/persistence/subscription.repository';
import { StatusEnum } from '../statuses/statuses.enum';
import { CreateAdminDto } from './dto/create-admin.dto';
import { WaitlistService } from '../waitlist/waitlist.service';
import { UserRepository } from '../users/infrastructure/persistence/user.repository';

type AdminProfileUserSummary = Pick<
  User,
  'id' | 'firstName' | 'lastName' | 'email'
>;

@Injectable()
export class AdminService {
  constructor(
    private readonly usersService: UsersService,
    private readonly paymentRepository: PaymentRepository,
    private readonly profileRepository: ProfileRepository,
    private readonly matchRepository: MatchRepository,
    private readonly prisma: PrismaService,
    private readonly reportsService: ReportsService,
    private readonly subscriptionRepository: SubscriptionRepository,
    private readonly waitlistService: WaitlistService,
    private readonly userRepository: UserRepository,
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
      recentUsers,
      recentMatches,
      recentProfiles,
      recentPayments,
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
      this.prisma.user.findMany({
        where: { deletedAt: null },
        select: { id: true, firstName: true, lastName: true, email: true },
        orderBy: { createdAt: 'desc' },
        take: 5,
      }),
      this.prisma.match.findMany({
        select: {
          id: true,
          status: true,
          createdAt: true,
          requesterId: true,
          targetId: true,
        },
        orderBy: { createdAt: 'desc' },
        take: 5,
      }),
      this.prisma.profile.findMany({
        select: { id: true, gender: true, country: true, userId: true },
        orderBy: { createdAt: 'desc' },
        take: 5,
      }),
      this.prisma.payment.findMany({
        select: {
          id: true,
          amount: true,
          type: true,
          status: true,
          createdAt: true,
          userId: true,
        },
        orderBy: { createdAt: 'desc' },
        take: 5,
      }),
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
      recentUsers: recentUsers.map((user) => ({
        id: user.id,
        name:
          `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email,
        email: user.email,
      })),
      recentMatches: recentMatches.map((match) => ({
        id: match.id,
        status: match.status,
        createdAt: match.createdAt.toISOString(),
      })),
      recentProfiles: recentProfiles.map((profile) => ({
        id: profile.id,
        gender: profile.gender,
        country: profile.country,
        userId: profile.userId,
      })),
      recentPayments: recentPayments.map((payment) => ({
        id: payment.id,
        amount: payment.amount,
        type: payment.type,
        status: payment.status,
        createdAt: payment.createdAt.toISOString(),
      })),
    };
  }

  async getStats() {
    const pendingPayments = await this.paymentRepository.findPending();
    return { pendingPaymentsCount: pendingPayments.length };
  }

  getPendingPayments() {
    return this.paymentRepository.findPending();
  }
  getAllPayments() {
    return this.paymentRepository.findAll();
  }

  async getProfiles(filters?: {
    isIdentityVerified?: boolean;
    isComplete?: boolean;
    isValidated?: boolean;
  }) {
    const profiles = await this.profileRepository.findAll(filters);
    if (!profiles.length) return [];

    const users = await this.usersService.findByIds(
      profiles.map((p) => p.userId),
    );
    const usersById = new Map<number, AdminProfileUserSummary>(
      users.map((user) => [
        Number(user.id),
        {
          id: user.id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
        },
      ]),
    );

    return profiles.map((profile) => ({
      ...profile,
      user: usersById.get(profile.userId) ?? null,
    }));
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

  async createAdmin(createAdminDto: CreateAdminDto): Promise<User> {
    return this.usersService.create({
      email: createAdminDto.email,
      firstName: createAdminDto.firstName,
      lastName: createAdminDto.lastName,
      phone: createAdminDto.phone || null,
      password: 'Admin@2026!',
      roles: createAdminDto.roles,
      status: { id: StatusEnum.active },
    });
  }

  async verifyIdentity(profileId: number) {
    const profile = await this.profileRepository.findById(profileId);
    if (!profile)
      throw new NotFoundException({ status: 404, error: 'profileNotFound' });
    return this.profileRepository.update(profileId, {
      isIdentityVerified: true,
    });
  }

  getReports(filters?: { status?: string }) {
    return this.reportsService.findAll(filters);
  }
  reviewReport(id: number, adminUserId: number) {
    return this.reportsService.reviewReport(id, adminUserId);
  }
  dismissReport(id: number, adminUserId: number) {
    return this.reportsService.dismissReport(id, adminUserId);
  }
  getSubscriptions(filters?: { tier?: string; status?: string }) {
    return this.subscriptionRepository.findAll(filters);
  }

  async listWaitlisted(filter?: { gender?: 'male' | 'female' }) {
    const users = await this.userRepository.findWaitlisted(filter);
    return Promise.all(
      users.map(async (user) => {
        const state =
          user.waitlistReason && user.waitlistedAt
            ? await this.waitlistService.getState(
                user.id as number,
                user.waitlistReason as 'gender_balance',
                user.waitlistedAt,
              )
            : null;
        return {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          waitlistReason: user.waitlistReason,
          waitlistedAt: user.waitlistedAt,
          position: state?.position ?? null,
          profile: user.profile
            ? {
                gender: user.profile.gender,
                isValidated: user.profile.isValidated,
              }
            : null,
        };
      }),
    );
  }

  async unblockWaitlisted(userId: number) {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new NotFoundException({ status: 404, error: 'userNotFound' });
    }
    if (!user.waitlistReason) {
      throw new ConflictException({ status: 409, error: 'userNotWaitlisted' });
    }

    const profile = await this.profileRepository.findByUserId(userId);
    if (profile) {
      await this.profileRepository.update(profile.id, { isValidated: true });
    }
    await this.waitlistService.activate(userId);
    return { success: true, userId };
  }
}
