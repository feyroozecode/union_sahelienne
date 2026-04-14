import { isProfileComplete } from './profile.rules';

describe('isProfileComplete', () => {
  it('should return true when the required completion fields are present', () => {
    expect(
      isProfileComplete({
        gender: 'female',
        age: 29,
        profession: 'Entrepreneur',
        maritalStatus: 'Single',
        country: 'Niger',
        city: 'Niamey',
        searchedAgeMin: 25,
        searchedAgeMax: 35,
        termsAcceptedAt: new Date(),
      }),
    ).toBe(true);
  });

  it('should return false when the gender is not one of the real matchmaking values', () => {
    expect(
      isProfileComplete({
        gender: 'unspecified',
        age: 29,
        profession: 'Entrepreneur',
        maritalStatus: 'Single',
        country: 'Niger',
        city: 'Niamey',
        searchedAgeMin: 25,
        searchedAgeMax: 35,
        termsAcceptedAt: new Date(),
      }),
    ).toBe(false);
  });
});
