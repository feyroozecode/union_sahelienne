import { WaitlistService } from './waitlist.service';

describe('WaitlistService', () => {
  const makeService = ({
    userRepoOverrides = {},
  }: {
    userRepoOverrides?: Record<string, unknown>;
  } = {}) => {
    const userRepository = {
      getWaitlistPosition: jest.fn().mockResolvedValue(0),
      update: jest
        .fn()
        .mockResolvedValue({
          id: 1,
          waitlistReason: null,
          waitlistedAt: null,
        }),
      ...userRepoOverrides,
    };

    return {
      service: new WaitlistService(userRepository as never),
      userRepository,
    };
  };

  it('places a user on the waitlist with reason + timestamp', async () => {
    const { service, userRepository } = makeService();
    await service.waitlist(7, 'gender_balance');

    expect(userRepository.update).toHaveBeenCalledWith(
      7,
      expect.objectContaining({
        waitlistReason: 'gender_balance',
        waitlistedAt: expect.any(Date),
      }),
    );
  });

  it('clears waitlist fields on activate', async () => {
    const { service, userRepository } = makeService();
    await service.activate(7);

    expect(userRepository.update).toHaveBeenCalledWith(7, {
      waitlistReason: null,
      waitlistedAt: null,
    });
  });

  it('returns null state when the user is not waitlisted', async () => {
    const { service, userRepository } = makeService({
      userRepoOverrides: {
        getWaitlistPosition: jest.fn().mockResolvedValue(0),
      },
    });

    await expect(service.getState(7, null)).resolves.toBeNull();
    expect(userRepository.getWaitlistPosition).not.toHaveBeenCalled();
  });

  it('returns reason + since + 1-based position when the user is waitlisted', async () => {
    const { service } = makeService({
      userRepoOverrides: {
        getWaitlistPosition: jest.fn().mockResolvedValue(2),
      },
    });
    const since = new Date('2026-06-01T00:00:00Z');

    await expect(
      service.getState(7, 'gender_balance', since),
    ).resolves.toEqual({
      reason: 'gender_balance',
      since,
      position: 3,
    });
  });
});
