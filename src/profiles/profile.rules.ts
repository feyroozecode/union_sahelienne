import { Profile } from './domain/profile';

type CompletionCandidate = Partial<
  Pick<
    Profile,
    | 'gender'
    | 'age'
    | 'profession'
    | 'maritalStatus'
    | 'country'
    | 'city'
    | 'searchedAgeMin'
    | 'searchedAgeMax'
    | 'termsAcceptedAt'
  >
>;

export const isProfileComplete = (profile: CompletionCandidate): boolean => {
  return Boolean(
    profile.gender &&
      ['male', 'female'].includes(profile.gender) &&
      profile.age !== null &&
      profile.age !== undefined &&
      profile.profession &&
      profile.maritalStatus &&
      profile.country &&
      profile.city &&
      profile.searchedAgeMin !== null &&
      profile.searchedAgeMin !== undefined &&
      profile.searchedAgeMax !== null &&
      profile.searchedAgeMax !== undefined &&
      profile.termsAcceptedAt,
  );
};
