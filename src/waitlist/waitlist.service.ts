import { Injectable } from '@nestjs/common';
import { UserRepository } from '../users/infrastructure/persistence/user.repository';
import { WaitlistReason, WaitlistState } from './waitlist.types';

@Injectable()
export class WaitlistService {
  constructor(private readonly userRepository: UserRepository) {}

  async waitlist(
    userId: number,
    reason: WaitlistReason,
    at: Date = new Date(),
  ): Promise<void> {
    await this.userRepository.update(userId, {
      waitlistReason: reason,
      waitlistedAt: at,
    });
  }

  async activate(userId: number): Promise<void> {
    await this.userRepository.update(userId, {
      waitlistReason: null,
      waitlistedAt: null,
    });
  }

  async getState(
    _userId: number,
    reason: WaitlistReason | null,
    since?: Date | null,
  ): Promise<WaitlistState | null> {
    if (!reason) {
      return null;
    }
    if (!since) {
      return null;
    }
    const rank = await this.userRepository.getWaitlistPosition(
      _userId,
      reason,
      since,
    );
    return {
      reason,
      since,
      position: rank + 1,
    };
  }
}
