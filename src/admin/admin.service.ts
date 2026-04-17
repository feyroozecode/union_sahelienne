import { Injectable, NotFoundException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { PaymentRepository } from '../payments/infrastructure/persistence/payment.repository';
import { ProfileRepository } from '../profiles/infrastructure/persistence/profile.repository';
import { QueryUserDto } from '../users/dto/query-user.dto';

@Injectable()
export class AdminService {
  constructor(
    private readonly usersService: UsersService,
    private readonly paymentRepository: PaymentRepository,
    private readonly profileRepository: ProfileRepository,
  ) {}

  async getStats() {
    const pendingPayments = await this.paymentRepository.findPending();
    return {
      pendingPaymentsCount: pendingPayments.length,
    };
  }

  getPendingPayments() {
    return this.paymentRepository.findPending();
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
