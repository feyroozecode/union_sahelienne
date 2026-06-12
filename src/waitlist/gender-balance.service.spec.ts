import { GenderBalanceService, GenderRatio } from './gender-balance.service';

describe('GenderBalanceService', () => {
  const make = ({
    ratio = { male: 0, female: 0 },
    queue = [] as Array<{ id: number; gender: 'male' | 'female' }>,
  }: {
    ratio?: GenderRatio;
    queue?: Array<{ id: number; gender: 'male' | 'female' }>;
  } = {}) => {
    const userRepository = {
      countValidatedByGender: jest.fn().mockResolvedValue(ratio),
      findOldestWaitlistedByGender: jest
        .fn()
        .mockImplementation((g: 'male' | 'female') =>
          Promise.resolve(queue.filter((u) => u.gender === g)),
        ),
    };
    return {
      service: new GenderBalanceService(userRepository as never),
      userRepository,
    };
  };

  describe('wouldExceedThreshold', () => {
    it('should return false on a 0/0 platform (cold start)', async () => {
      const { service } = make({ ratio: { male: 0, female: 0 } });
      await expect(service.wouldExceedThreshold('male')).resolves.toBe(false);
    });

    it('should return false at exactly 75/25 (inclusive boundary)', async () => {
      const { service } = make({ ratio: { male: 75, female: 25 } });
      await expect(service.wouldExceedThreshold('male')).resolves.toBe(false);
    });

    it('should return true at 76/24', async () => {
      const { service } = make({ ratio: { male: 76, female: 24 } });
      await expect(service.wouldExceedThreshold('male')).resolves.toBe(true);
    });

    it('should apply to either gender symmetrically', async () => {
      const { service } = make({ ratio: { male: 20, female: 80 } });
      await expect(service.wouldExceedThreshold('female')).resolves.toBe(true);
      await expect(service.wouldExceedThreshold('male')).resolves.toBe(false);
    });

    it('should treat "other" / unspecified genders as not exceeding', async () => {
      const { service } = make({ ratio: { male: 80, female: 20 } });
      await expect(service.wouldExceedThreshold('other')).resolves.toBe(false);
    });
  });

  describe('findUsersToAutoUnblock', () => {
    it('should return an empty list when no one is waitlisted', async () => {
      const { service } = make();
      await expect(service.findUsersToAutoUnblock()).resolves.toEqual([]);
    });

    it('should not unblock anyone of the over-represented gender when still > 75%', async () => {
      const { service } = make({
        ratio: { male: 80, female: 20 },
        queue: [
          { id: 11, gender: 'male' },
          { id: 12, gender: 'male' },
        ],
      });
      await expect(service.findUsersToAutoUnblock()).resolves.toEqual([]);
    });

    it('should not unblock any minority when ratio stays > 75% after first add', async () => {
      const { service } = make({
        ratio: { male: 80, female: 20 },
        queue: [
          { id: 21, gender: 'female' },
          { id: 22, gender: 'female' },
          { id: 23, gender: 'female' },
        ],
      });
      await expect(service.findUsersToAutoUnblock()).resolves.toEqual([]);
    });

    it('should unblock female minorities when at the threshold edge 74/26', async () => {
      const { service } = make({
        ratio: { male: 74, female: 26 },
        queue: [
          { id: 31, gender: 'female' },
          { id: 32, gender: 'female' },
        ],
      });
      await expect(service.findUsersToAutoUnblock()).resolves.toEqual([31, 32]);
    });

    it('should cap unblocking at 75%', async () => {
      const { service } = make({
        ratio: { male: 75, female: 25 },
        queue: [
          { id: 51, gender: 'female' },
          { id: 52, gender: 'female' },
          { id: 53, gender: 'female' },
        ],
      });
      await expect(service.findUsersToAutoUnblock()).resolves.toEqual([
        51, 52, 53,
      ]);
    });

    it('should unblock multiple female minorities when ratio permits', async () => {
      const { service } = make({
        ratio: { male: 60, female: 40 },
        queue: [
          { id: 41, gender: 'female' },
          { id: 42, gender: 'female' },
          { id: 43, gender: 'female' },
        ],
      });
      await expect(service.findUsersToAutoUnblock()).resolves.toEqual([
        41, 42, 43,
      ]);
    });
  });
});
