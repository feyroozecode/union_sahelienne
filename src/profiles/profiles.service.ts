import { Injectable, NotFoundException } from '@nestjs/common';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { ProfileRepository } from './infrastructure/persistence/profile.repository';
import { Profile } from './domain/profile';
import { UsersService } from '../users/users.service';
import { AccountValidationService } from '../account-validation/account-validation.service';
import { isProfileComplete } from './profile.rules';

@Injectable()
export class ProfilesService {
  constructor(
    private readonly profileRepository: ProfileRepository,
    private readonly usersService: UsersService,
    private readonly accountValidationService: AccountValidationService,
  ) {}

  findById(id: Profile['id']) {
    return this.profileRepository.findById(id);
  }

  findByUserId(userId: Profile['userId']) {
    return this.profileRepository.findByUserId(userId);
  }

  async getMyProfile(userId: number): Promise<Profile | null> {
    return this.profileRepository.findByUserId(userId);
  }

  async upsertMyProfile(
    userId: number,
    updateProfileDto: UpdateProfileDto,
  ): Promise<Profile> {
    const user = await this.usersService.findById(userId);

    if (!user) {
      throw new NotFoundException({
        status: 404,
        error: 'userNotFound',
      });
    }

    const existingProfile = await this.profileRepository.findByUserId(userId);
    const merged = {
      ...existingProfile,
      ...updateProfileDto,
      termsAcceptedAt:
        updateProfileDto.termsAcceptedAt !== undefined
          ? new Date(updateProfileDto.termsAcceptedAt)
          : (existingProfile?.termsAcceptedAt ?? null),
    };

    const payload = {
      userId,
      gender: merged.gender ?? existingProfile?.gender ?? 'unspecified',
      age: merged.age ?? null,
      profession: merged.profession ?? null,
      maritalStatus: merged.maritalStatus ?? null,
      childrenCount: merged.childrenCount ?? null,
      ethnicity: merged.ethnicity ?? null,
      country: merged.country ?? null,
      city: merged.city ?? null,
      bloodType: merged.bloodType ?? null,
      hivTest: merged.hivTest ?? null,
      hepatitisTest: merged.hepatitisTest ?? null,
      searchedAgeMin: merged.searchedAgeMin ?? null,
      searchedAgeMax: merged.searchedAgeMax ?? null,
      searchedMarital: merged.searchedMarital ?? null,
      searchedCriteria: merged.searchedCriteria ?? null,
      termsAcceptedAt: merged.termsAcceptedAt ?? null,
      isComplete: isProfileComplete(merged),
      isValidated: existingProfile?.isValidated ?? false,
      isIdentityVerified: existingProfile?.isIdentityVerified ?? false,
      identityDocType: existingProfile?.identityDocType ?? null,
      identityDocPath: existingProfile?.identityDocPath ?? null,
      subscriptionType: existingProfile?.subscriptionType ?? null,
      matchCreditsTotal: existingProfile?.matchCreditsTotal ?? 0,
      matchCreditsUsed: existingProfile?.matchCreditsUsed ?? 0,
    };

    const profile = existingProfile
      ? await this.profileRepository.update(existingProfile.id, payload)
      : await this.profileRepository.create(payload);

    if (!profile) {
      throw new NotFoundException({
        status: 404,
        error: 'profileNotFound',
      });
    }

    await this.accountValidationService.syncProfileValidationState(userId);

    const persistedProfile = await this.profileRepository.findById(profile.id);

    if (!persistedProfile) {
      throw new NotFoundException({
        status: 404,
        error: 'profileNotFound',
      });
    }

    return persistedProfile;
  }

  async acceptTerms(userId: number): Promise<Profile> {
    return this.upsertMyProfile(userId, {
      termsAcceptedAt: new Date().toISOString(),
    });
  }
}
