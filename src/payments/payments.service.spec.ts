import { PaymentsService } from './payments.service';
import { Profile } from '../profiles/domain/profile';
import { User } from '../users/domain/user';
import { Payment } from './domain/payment';

type ProfileStub = Pick<Profile, 'id' | 'isValidated'>;

const makeProfile = (overrides: Partial<ProfileStub> = {}): ProfileStub => ({
  id: 10,
  isValidated: false,
  ...overrides,
});

const makeUser = (overrides: Partial<User> = {}): User => ({
  id: 5,
  email: 'a@b.c',
  provider: 'email',
  firstName: 'A',
  lastName: 'B',
  createdAt: new Date('2026-01-01'),
  updatedAt: new Date('2026-01-01'),
  deletedAt: null as unknown as Date,
  ...overrides,
});

describe('PaymentsService.validatePayment (gender balance)', () => {
  const make = ({ wouldExceed = false }: { wouldExceed?: boolean } = {}) => {
    const paymentRepo = {
      findById: jest.fn().mockResolvedValue({
        id: 99,
        userId: 5,
        status: 'pending',
        type: 'manual',
        receiptPath: null,
        waveRef: null,
        amount: 5000,
      } as Payment),
      update: jest
        .fn()
        .mockResolvedValue({ id: 99, status: 'validated' } as Payment),
    };
    const usersService = {
      findById: jest.fn().mockResolvedValue(
        makeUser({
          id: 5,
          profile: makeProfile({ id: 10, isValidated: false }) as Profile,
        }),
      ),
    };
    const profileRepo = {
      findByUserId: jest
        .fn()
        .mockResolvedValue(makeProfile({ id: 10, isValidated: false })),
      update: jest.fn().mockResolvedValue({ id: 10, isValidated: true }),
    };
    const subscriptionsService = {
      createFromPayment: jest.fn().mockResolvedValue({ creditsUsed: 0 }),
    };
    const accountValidationService = {
      syncProfileValidationState: jest.fn().mockResolvedValue(undefined),
    };
    const filesLocalService = {
      create: jest.fn(),
    };
    const genderBalance = {
      wouldExceedThreshold: jest.fn().mockResolvedValue(wouldExceed),
      findUsersToAutoUnblock: jest.fn().mockResolvedValue([]),
    };
    const waitlistService = {
      waitlist: jest.fn().mockResolvedValue(undefined),
      activate: jest.fn().mockResolvedValue(undefined),
      getState: jest.fn(),
    };

    const service = new PaymentsService(
      paymentRepo as never,
      filesLocalService as never,
      accountValidationService as never,
      profileRepo as never,
      subscriptionsService as never,
      genderBalance as never,
      waitlistService as never,
      usersService as never,
    );

    return {
      service,
      profileRepo,
      waitlistService,
      genderBalance,
      paymentRepo,
      usersService,
    };
  };

  it('should activate the profile when under the 75% threshold', async () => {
    const { service, profileRepo, waitlistService } = make({
      wouldExceed: false,
    });
    await service.validatePayment(99, 1);
    // Under threshold, no isValidated override and no waitlist side-effect.
    const updateCalls = (profileRepo.update as jest.Mock).mock.calls;
    const hasInvalidateCall = updateCalls.some(
      ([_, payload]) => payload?.isValidated === false,
    );
    expect(hasInvalidateCall).toBe(false);
    expect(waitlistService.waitlist).not.toHaveBeenCalled();
  });

  it('should waitlist the user when their gender would exceed 75%', async () => {
    const { service, profileRepo, waitlistService } = make({
      wouldExceed: true,
    });
    await service.validatePayment(99, 1);
    expect(profileRepo.update).toHaveBeenCalledWith(
      10,
      expect.objectContaining({ isValidated: false }),
    );
    expect(waitlistService.waitlist).toHaveBeenCalledWith(5, 'gender_balance');
  });
});
