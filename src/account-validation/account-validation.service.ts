import { Injectable } from '@nestjs/common';
import { PaymentRepository } from '../payments/infrastructure/persistence/payment.repository';
import { ProfileRepository } from '../profiles/infrastructure/persistence/profile.repository';

@Injectable()
export class AccountValidationService {
  constructor(
    private readonly profileRepository: ProfileRepository,
    private readonly paymentRepository: PaymentRepository,
  ) {}

  async syncProfileValidationState(userId: number): Promise<void> {
    const profile = await this.profileRepository.findByUserId(userId);

    if (!profile) {
      return;
    }

    const shouldBeValidated =
      profile.isComplete &&
      (await this.paymentRepository.hasValidatedPayment(userId));

    if (profile.isValidated === shouldBeValidated) {
      return;
    }

    await this.profileRepository.update(profile.id, {
      isValidated: shouldBeValidated,
    });
  }
}
