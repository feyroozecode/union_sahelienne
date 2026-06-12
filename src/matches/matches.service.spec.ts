import {
  ForbiddenException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { MatchesService } from './matches.service';

describe('MatchesService', () => {
  const makeService = ({
    repositoryOverrides = {},
    usersServiceOverrides = {},
  }: {
    repositoryOverrides?: Record<string, unknown>;
    usersServiceOverrides?: Record<string, unknown>;
  } = {}) => {
    const repository = {
      countActiveByUserId: jest.fn().mockResolvedValue(0),
      findBetweenUsers: jest.fn().mockResolvedValue(null),
      create: jest.fn(),
      findByUserId: jest.fn(),
      findById: jest.fn(),
      update: jest.fn(),
      ...repositoryOverrides,
    };

    const usersService = {
      findById: jest.fn(),
      findBrowseUsers: jest.fn(),
      ...usersServiceOverrides,
    };

    const subscriptionsService = {
      getAvailableCredits: jest.fn().mockResolvedValue(99),
      deductCredit: jest.fn().mockResolvedValue(undefined),
    };

    return {
      service: new MatchesService(
        repository as never,
        usersService as never,
        subscriptionsService as never,
      ),
      repository,
      usersService,
      subscriptionsService,
    };
  };

  it('should return only accepted matches for /matches/me', async () => {
    const { service, repository } = makeService({
      repositoryOverrides: {
        findByUserId: jest.fn().mockResolvedValue([
          { id: 1, status: 'pending' },
          { id: 2, status: 'accepted' },
          { id: 3, status: 'rejected' },
        ]),
      },
    });

    await expect(service.findMyMatches(7)).resolves.toEqual([
      { id: 2, status: 'accepted' },
    ]);
    expect(repository.findByUserId).toHaveBeenCalledWith(7);
  });

  it('should reject interest requests between users of the same gender', async () => {
    const { service, usersService } = makeService({
      usersServiceOverrides: {
        findById: jest
          .fn()
          .mockResolvedValueOnce({
            id: 1,
            profile: { gender: 'male', isValidated: true },
          })
          .mockResolvedValueOnce({
            id: 2,
            profile: { gender: 'male', isValidated: true },
          }),
      },
    });

    await expect(service.sendInterest(1, 2)).rejects.toBeInstanceOf(
      UnprocessableEntityException,
    );
    expect(usersService.findById).toHaveBeenCalledTimes(2);
  });

  it('should reject new interests when the requester has no available credits', async () => {
    const { service, subscriptionsService } = makeService({
      usersServiceOverrides: {
        findById: jest
          .fn()
          .mockResolvedValueOnce({
            id: 1,
            profile: { gender: 'male', isValidated: true },
          })
          .mockResolvedValueOnce({
            id: 2,
            profile: { gender: 'female', isValidated: true },
          }),
      },
    });
    (subscriptionsService.getAvailableCredits as jest.Mock).mockResolvedValue(
      0,
    );

    await expect(service.sendInterest(1, 2)).rejects.toBeInstanceOf(
      ForbiddenException,
    );
  });

  it('should reject findCandidates for a waitlisted requester with code "waitlisted"', async () => {
    const { service } = makeService({
      usersServiceOverrides: {
        findById: jest.fn().mockResolvedValue({
          id: 1,
          profile: { gender: 'female', isValidated: false },
          waitlistReason: 'gender_balance',
          waitlistedAt: new Date(),
        }),
      },
    });

    await expect(
      service.findCandidates(1, { page: 1, limit: 10 }),
    ).rejects.toMatchObject({
      status: 403,
      response: { error: 'waitlisted' },
    });
  });
});
