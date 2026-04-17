import { Profile as PrismaProfile } from '@prisma/client';
import { Profile } from '../../../../domain/profile';

export class ProfileMapper {
  static toDomain(raw: PrismaProfile): Profile {
    const domainEntity = new Profile();
    domainEntity.id = raw.id;
    domainEntity.userId = raw.userId;
    domainEntity.gender = raw.gender;
    domainEntity.age = raw.age;
    domainEntity.profession = raw.profession;
    domainEntity.maritalStatus = raw.maritalStatus;
    domainEntity.childrenCount = raw.childrenCount;
    domainEntity.ethnicity = raw.ethnicity;
    domainEntity.country = raw.country;
    domainEntity.city = raw.city;
    domainEntity.bloodType = raw.bloodType;
    domainEntity.hivTest = raw.hivTest;
    domainEntity.hepatitisTest = raw.hepatitisTest;
    domainEntity.searchedAgeMin = raw.searchedAgeMin;
    domainEntity.searchedAgeMax = raw.searchedAgeMax;
    domainEntity.searchedMarital = raw.searchedMarital;
    domainEntity.searchedCriteria = raw.searchedCriteria;
    domainEntity.termsAcceptedAt = raw.termsAcceptedAt;
    domainEntity.isComplete = raw.isComplete;
    domainEntity.isValidated = raw.isValidated;
    domainEntity.identityDocType = raw.identityDocType;
    domainEntity.identityDocPath = raw.identityDocPath;
    domainEntity.isIdentityVerified = raw.isIdentityVerified;
    domainEntity.subscriptionType = raw.subscriptionType;
    domainEntity.matchCreditsTotal = raw.matchCreditsTotal;
    domainEntity.matchCreditsUsed = raw.matchCreditsUsed;
    domainEntity.createdAt = raw.createdAt;
    domainEntity.updatedAt = raw.updatedAt;
    return domainEntity;
  }

  static toPersistence(domainEntity: Partial<Profile>) {
    return {
      ...(domainEntity.id ? { id: domainEntity.id } : {}),
      ...(domainEntity.userId ? { userId: domainEntity.userId } : {}),
      ...(domainEntity.gender !== undefined
        ? { gender: domainEntity.gender }
        : {}),
      ...(domainEntity.age !== undefined ? { age: domainEntity.age } : {}),
      ...(domainEntity.profession !== undefined
        ? { profession: domainEntity.profession }
        : {}),
      ...(domainEntity.maritalStatus !== undefined
        ? { maritalStatus: domainEntity.maritalStatus }
        : {}),
      ...(domainEntity.childrenCount !== undefined
        ? { childrenCount: domainEntity.childrenCount }
        : {}),
      ...(domainEntity.ethnicity !== undefined
        ? { ethnicity: domainEntity.ethnicity }
        : {}),
      ...(domainEntity.country !== undefined
        ? { country: domainEntity.country }
        : {}),
      ...(domainEntity.city !== undefined ? { city: domainEntity.city } : {}),
      ...(domainEntity.bloodType !== undefined
        ? { bloodType: domainEntity.bloodType }
        : {}),
      ...(domainEntity.hivTest !== undefined
        ? { hivTest: domainEntity.hivTest }
        : {}),
      ...(domainEntity.hepatitisTest !== undefined
        ? { hepatitisTest: domainEntity.hepatitisTest }
        : {}),
      ...(domainEntity.searchedAgeMin !== undefined
        ? { searchedAgeMin: domainEntity.searchedAgeMin }
        : {}),
      ...(domainEntity.searchedAgeMax !== undefined
        ? { searchedAgeMax: domainEntity.searchedAgeMax }
        : {}),
      ...(domainEntity.searchedMarital !== undefined
        ? { searchedMarital: domainEntity.searchedMarital }
        : {}),
      ...(domainEntity.searchedCriteria !== undefined
        ? { searchedCriteria: domainEntity.searchedCriteria }
        : {}),
      ...(domainEntity.termsAcceptedAt !== undefined
        ? { termsAcceptedAt: domainEntity.termsAcceptedAt }
        : {}),
      ...(domainEntity.isComplete !== undefined
        ? { isComplete: domainEntity.isComplete }
        : {}),
      ...(domainEntity.isValidated !== undefined
        ? { isValidated: domainEntity.isValidated }
        : {}),
      ...(domainEntity.identityDocType !== undefined
        ? { identityDocType: domainEntity.identityDocType }
        : {}),
      ...(domainEntity.identityDocPath !== undefined
        ? { identityDocPath: domainEntity.identityDocPath }
        : {}),
      ...(domainEntity.isIdentityVerified !== undefined
        ? { isIdentityVerified: domainEntity.isIdentityVerified }
        : {}),
      ...(domainEntity.subscriptionType !== undefined
        ? { subscriptionType: domainEntity.subscriptionType }
        : {}),
      ...(domainEntity.matchCreditsTotal !== undefined
        ? { matchCreditsTotal: domainEntity.matchCreditsTotal }
        : {}),
      ...(domainEntity.matchCreditsUsed !== undefined
        ? { matchCreditsUsed: domainEntity.matchCreditsUsed }
        : {}),
      ...(domainEntity.createdAt ? { createdAt: domainEntity.createdAt } : {}),
      ...(domainEntity.updatedAt ? { updatedAt: domainEntity.updatedAt } : {}),
    };
  }
}
