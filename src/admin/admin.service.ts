import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { PaymentRepository } from '../payments/infrastructure/persistence/payment.repository';
import { ProfileRepository } from '../profiles/infrastructure/persistence/profile.repository';
import { MatchRepository } from '../matches/infrastructure/persistence/match.repository';
import { PrismaService } from '../database/prisma.service';
import { QueryUserDto } from '../users/dto/query-user.dto';
import { User } from '../users/domain/user';
import { RoleEnum } from '../roles/roles.enum';
import { StatusEnum } from '../statuses/statuses.enum';
import { CreateAdminDto } from './dto/create-admin.dto';

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
        select: { id: true, status: true, createdAt: true, requesterId: true, targetId: true },
        orderBy: { createdAt: 'desc' },
        take: 5,
      }),
      this.prisma.profile.findMany({
        select: { id: true, gender: true, country: true, userId: true },
        orderBy: { createdAt: 'desc' },
        take: 5,
      }),
      this.prisma.payment.findMany({
        select: { id: true, amount: true, type: true, status: true, createdAt: true, userId: true },
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
        name: `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email,
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

  async getProfiles(filters?: {
    isIdentityVerified?: boolean;
    isComplete?: boolean;
    isValidated?: boolean;
  }) {
    const profiles = await this.profileRepository.findAll(filters);

    if (!profiles.length) {
      return [];
    }

    const users = await this.usersService.findByIds(
      profiles.map((profile) => profile.userId),
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

  async createAdmin(createAdminDto: CreateAdminDto) {
  // const roleId = createAdminDto.role;

  // // Validate the role exists
  // const validRoles = Object.values(RoleEnum)
  //   .map(String)
  //   .includes(String(roleId));

  // if (!validRoles) {
  //   throw new BadRequestException({
  //     status: 400,
  //     error: 'invalidRole',
  //   });
  // }

  // Create user with admin role
  return this.usersService.create({
    email: createAdminDto.email,
    firstName: createAdminDto.firstName,
    lastName: createAdminDto.lastName,
    phone: createAdminDto.phone || null,
    password: 'Admin@2026', // Generate temporary password or require one
    roles: createAdminDto.roles,
    status: {
      id: StatusEnum.active,
    },
  });
}
}
