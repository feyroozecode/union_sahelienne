import { UnprocessableEntityException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthProvidersEnum } from './auth-providers.enum';
import { StatusEnum } from '../statuses/statuses.enum';

describe('AuthService', () => {
  const makeService = (usersServiceOverrides: Record<string, unknown> = {}) => {
    const usersService = {
      findByEmail: jest.fn(),
      updateAuthState: jest.fn(),
      findById: jest.fn(),
      ...usersServiceOverrides,
    };

    const service = new AuthService(
      {} as never,
      usersService as never,
      {} as never,
      {} as never,
      {} as never,
      {} as never,
      {} as never,
    );

    return { service, usersService };
  };

  it('should reject password login for accounts that are still inactive', async () => {
    const { service } = makeService({
      findByEmail: jest.fn().mockResolvedValue({
        id: 1,
        email: 'user@example.com',
        provider: AuthProvidersEnum.email,
        status: { id: StatusEnum.inactive },
      }),
    });

    await expect(
      service.validateLogin({
        email: 'user@example.com',
        password: 'secret',
      }),
    ).rejects.toBeInstanceOf(UnprocessableEntityException);
  });
});
