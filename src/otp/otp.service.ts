import { Injectable, UnprocessableEntityException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { MailService } from '../mail/mail.service';
import { User } from '../users/domain/user';
import { UsersService } from '../users/users.service';
import { OtpGateway } from './otp-gateway';
import { AllConfigType } from '../config/config.type';

export type OtpPurpose = 'login' | 'register' | 'forgot-password';
export type OtpChannel = 'email' | 'phone';

const OTP_EXPIRY_MINUTES = 10;

@Injectable()
export class OtpService {
  constructor(
    private readonly usersService: UsersService,
    private readonly mailService: MailService,
    private readonly otpGateway: OtpGateway,
    private readonly configService: ConfigService<AllConfigType>,
  ) {}

  async sendOtp(
    user: User,
    options: {
      purpose: OtpPurpose;
      preferredChannel?: OtpChannel;
    },
  ): Promise<{
    requiresOtp: true;
    channel: OtpChannel;
    target: string;
    expiresAt: number;
    code?: string;
  }> {
    const channel = this.resolveChannel(user, options.preferredChannel);
    const target = channel === 'phone' ? user.phone : user.email;

    if (!target) {
      throw new UnprocessableEntityException({
        status: 422,
        errors: {
          target: 'missingOtpTarget',
        },
      });
    }

    const code = crypto.randomInt(100000, 1000000).toString();
    const expiry = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000);
    const otpHash = await bcrypt.hash(code, await bcrypt.genSalt());
    const isPreBetaMode = this.configService.get('app.preBetaMode', { infer: true });

    await this.usersService.updateAuthState(user.id, {
      otpHash,
      otpPurpose: options.purpose,
      otpExpiry: expiry,
      lastOtpAt: new Date(),
    });

    // Skip email/SMS sending in pre-beta mode - code will be returned in response
    if (!isPreBetaMode) {
      if (channel === 'email') {
        await this.mailService.sendOtpCode({
          to: target,
          data: {
            code,
            purpose: options.purpose,
            expiresAt: expiry,
          },
        });
      } else {
        const purposeLabel =
          options.purpose === 'forgot-password'
            ? 'password reset'
            : options.purpose === 'register'
              ? 'account activation'
              : 'login verification';

        await this.otpGateway.sendOtp({
          to: target,
          message: `Your Union Sahélienne OTP code for ${purposeLabel} is ${code}. It expires in ${OTP_EXPIRY_MINUTES} minutes.`,
        });
      }
    }

    return {
      requiresOtp: true,
      channel,
      target: this.maskTarget(target, channel),
      expiresAt: expiry.getTime(),
      // Include code in response for pre-beta testing
      ...(isPreBetaMode && { code }),
    };
  }

  async verifyOtp(user: User, otp: string, purpose: OtpPurpose): Promise<void> {
    if (!user.otpHash || !user.otpExpiry || !user.otpPurpose) {
      throw new UnprocessableEntityException({
        status: 422,
        errors: {
          otp: 'otpNotRequested',
        },
      });
    }

    if (user.otpPurpose !== purpose) {
      throw new UnprocessableEntityException({
        status: 422,
        errors: {
          otp: 'otpPurposeMismatch',
        },
      });
    }

    if (new Date(user.otpExpiry).getTime() < Date.now()) {
      throw new UnprocessableEntityException({
        status: 422,
        errors: {
          otp: 'otpExpired',
        },
      });
    }

    const isValidOtp = await bcrypt.compare(otp, user.otpHash);

    if (!isValidOtp) {
      throw new UnprocessableEntityException({
        status: 422,
        errors: {
          otp: 'invalidOtp',
        },
      });
    }

    await this.usersService.updateAuthState(user.id, {
      otpHash: null,
      otpPurpose: null,
      otpExpiry: null,
      lastOtpAt: null,
    });
  }

  private resolveChannel(
    user: User,
    preferredChannel?: OtpChannel,
  ): OtpChannel {
    if (preferredChannel === 'phone' && user.phone) {
      return 'phone';
    }

    if (preferredChannel === 'email' && user.email) {
      return 'email';
    }

    if (user.phone) {
      return 'phone';
    }

    return 'email';
  }

  private maskTarget(target: string, channel: OtpChannel): string {
    if (channel === 'phone') {
      return target.length > 4
        ? `${'*'.repeat(Math.max(target.length - 4, 0))}${target.slice(-4)}`
        : target;
    }

    const [localPart, domain] = target.split('@');

    if (!domain) {
      return target;
    }

    const visible = localPart.slice(0, 2);
    return `${visible}${'*'.repeat(Math.max(localPart.length - 2, 0))}@${domain}`;
  }
}
