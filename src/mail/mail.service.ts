import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { I18nContext } from 'nestjs-i18n';
import { MailData } from './interfaces/mail-data.interface';

import { MaybeType } from '../utils/types/maybe.type';
import { MailerService } from '../mailer/mailer.service';
import path from 'path';
import fs from 'node:fs/promises';
import { AllConfigType } from '../config/config.type';

@Injectable()
export class MailService {
  constructor(
    private readonly mailerService: MailerService,
    private readonly configService: ConfigService<AllConfigType>,
  ) {}

  private async resolveTemplatePath(templateName: string): Promise<string> {
    const workingDirectory = this.configService.getOrThrow('app.workingDirectory', {
      infer: true,
    });

    // Try multiple paths in order of preference
    const possiblePaths = [
      // Development path (src)
      path.join(workingDirectory, 'src', 'mail', 'mail-templates', templateName),
      // Production path (dist)
      path.join(workingDirectory, 'dist', 'mail', 'mail-templates', templateName),
      // Alternative production path (same directory as dist)
      path.join(workingDirectory, 'mail', 'mail-templates', templateName),
    ];

    for (const templatePath of possiblePaths) {
      try {
        await fs.access(templatePath);
        return templatePath;
      } catch {
        // File doesn't exist, try next path
        continue;
      }
    }

    // Return the first path as default (will fail with proper error if not found)
    return possiblePaths[0];
  }

  async userSignUp(mailData: MailData<{ hash: string }>): Promise<void> {
    const i18n = I18nContext.current();
    let emailConfirmTitle: MaybeType<string>;
    let text1: MaybeType<string>;
    let text2: MaybeType<string>;
    let text3: MaybeType<string>;

    if (i18n) {
      [emailConfirmTitle, text1, text2, text3] = await Promise.all([
        i18n.t('common.confirmEmail'),
        i18n.t('confirm-email.text1'),
        i18n.t('confirm-email.text2'),
        i18n.t('confirm-email.text3'),
      ]);
    }

    const url = new URL(
      this.configService.getOrThrow('app.frontendDomain', {
        infer: true,
      }) + '/confirm-email',
    );
    url.searchParams.set('hash', mailData.data.hash);

    await this.mailerService.sendMail({
      to: mailData.to,
      subject: emailConfirmTitle,
      text: `${url.toString()} ${emailConfirmTitle}`,
      templatePath: await this.resolveTemplatePath('activation.hbs'),
      context: {
        title: emailConfirmTitle,
        url: url.toString(),
        actionTitle: emailConfirmTitle,
        app_name: this.configService.get('app.name', { infer: true }),
        text1,
        text2,
        text3,
      },
    });
  }

  async forgotPassword(
    mailData: MailData<{ hash: string; tokenExpires: number }>,
  ): Promise<void> {
    const i18n = I18nContext.current();
    let resetPasswordTitle: MaybeType<string>;
    let text1: MaybeType<string>;
    let text2: MaybeType<string>;
    let text3: MaybeType<string>;
    let text4: MaybeType<string>;

    if (i18n) {
      [resetPasswordTitle, text1, text2, text3, text4] = await Promise.all([
        i18n.t('common.resetPassword'),
        i18n.t('reset-password.text1'),
        i18n.t('reset-password.text2'),
        i18n.t('reset-password.text3'),
        i18n.t('reset-password.text4'),
      ]);
    }

    const url = new URL(
      this.configService.getOrThrow('app.frontendDomain', {
        infer: true,
      }) + '/password-change',
    );
    url.searchParams.set('hash', mailData.data.hash);
    url.searchParams.set('expires', mailData.data.tokenExpires.toString());

    await this.mailerService.sendMail({
      to: mailData.to,
      subject: resetPasswordTitle,
      text: `${url.toString()} ${resetPasswordTitle}`,
      templatePath: await this.resolveTemplatePath('reset-password.hbs'),
      context: {
        title: resetPasswordTitle,
        url: url.toString(),
        actionTitle: resetPasswordTitle,
        app_name: this.configService.get('app.name', {
          infer: true,
        }),
        text1,
        text2,
        text3,
        text4,
      },
    });
  }

  async confirmNewEmail(mailData: MailData<{ hash: string }>): Promise<void> {
    const i18n = I18nContext.current();
    let emailConfirmTitle: MaybeType<string>;
    let text1: MaybeType<string>;
    let text2: MaybeType<string>;
    let text3: MaybeType<string>;

    if (i18n) {
      [emailConfirmTitle, text1, text2, text3] = await Promise.all([
        i18n.t('common.confirmEmail'),
        i18n.t('confirm-new-email.text1'),
        i18n.t('confirm-new-email.text2'),
        i18n.t('confirm-new-email.text3'),
      ]);
    }

    const url = new URL(
      this.configService.getOrThrow('app.frontendDomain', {
        infer: true,
      }) + '/confirm-new-email',
    );
    url.searchParams.set('hash', mailData.data.hash);

    await this.mailerService.sendMail({
      to: mailData.to,
      subject: emailConfirmTitle,
      text: `${url.toString()} ${emailConfirmTitle}`,
      templatePath: await this.resolveTemplatePath('confirm-new-email.hbs'),
      context: {
        title: emailConfirmTitle,
        url: url.toString(),
        actionTitle: emailConfirmTitle,
        app_name: this.configService.get('app.name', { infer: true }),
        text1,
        text2,
        text3,
      },
    });
  }

  async sendOtpCode(
    mailData: MailData<{
      code: string;
      purpose: 'login' | 'register' | 'forgot-password';
      expiresAt: Date;
    }>,
  ): Promise<void> {
    const purposeLabel =
      mailData.data.purpose === 'forgot-password'
        ? 'password reset'
        : mailData.data.purpose === 'register'
          ? 'account activation'
          : 'login verification';

    await this.mailerService.sendMail({
      to: mailData.to,
      subject: 'Union Sahelienne OTP code',
      text: `Your OTP code for ${purposeLabel} is ${mailData.data.code}. It expires at ${mailData.data.expiresAt.toISOString()}.`,
      html: `<p>Your OTP code for <strong>${purposeLabel}</strong> is <strong>${mailData.data.code}</strong>.</p><p>It expires at ${mailData.data.expiresAt.toISOString()}.</p>`,
      templatePath: '',
      context: {},
    });
  }
}
