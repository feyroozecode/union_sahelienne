import { Injectable } from '@nestjs/common';
import { UserRepository } from '../users/infrastructure/persistence/user.repository';

export type Gender = 'male' | 'female' | 'other';

export interface GenderRatio {
  male: number;
  female: number;
}

const THRESHOLD_PERCENT = 75;

@Injectable()
export class GenderBalanceService {
  constructor(private readonly userRepository: UserRepository) {}

  async getRatio(): Promise<GenderRatio> {
    return this.userRepository.countValidatedByGender();
  }

  async wouldExceedThreshold(newGender: Gender): Promise<boolean> {
    if (newGender === 'other') {
      return false;
    }
    const ratio = await this.userRepository.countValidatedByGender();
    if (newGender === 'male') {
      return this.wouldExceed(ratio.male, ratio.female);
    }
    return this.wouldExceed(ratio.female, ratio.male);
  }

  /**
   * Re-evaluate the waitlist. We can unblock a minority-gender waitlisted
   * user only if admitting them keeps the resulting ratio ≤ 75%.
   * Walks the oldest minority users one at a time, stopping as soon as
   * the next admission would tip the ratio.
   */
  async findUsersToAutoUnblock(): Promise<number[]> {
    const ratio = await this.userRepository.countValidatedByGender();
    const total = ratio.male + ratio.female;
    if (total === 0) {
      return [];
    }

    const dominantGender: Gender =
      ratio.male >= ratio.female ? 'male' : 'female';
    const minorityQueue =
      await this.userRepository.findOldestWaitlistedByGender(
        dominantGender === 'male' ? 'female' : 'male',
      );

    if (minorityQueue.length === 0) {
      return [];
    }

    const unblocked: number[] = [];
    let projectedMale = ratio.male;
    let projectedFemale = ratio.female;

    for (const candidate of minorityQueue) {
      if (dominantGender === 'male') {
        projectedFemale += 1;
      } else {
        projectedMale += 1;
      }
      if (this.wouldExceed(projectedMale, projectedFemale)) {
        break;
      }
      unblocked.push(Number(candidate.id));
    }

    return unblocked;
  }

  private wouldExceed(targetCount: number, otherCount: number): boolean {
    const total = targetCount + otherCount;
    if (total === 0) {
      return false;
    }
    return (targetCount / total) * 100 > THRESHOLD_PERCENT;
  }
}
