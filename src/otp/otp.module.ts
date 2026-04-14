import { Module } from '@nestjs/common';
import { MailModule } from '../mail/mail.module';
import { UsersModule } from '../users/users.module';
import { LoggingOtpGateway } from './infrastructure/logging-otp.gateway';
import { OtpGateway } from './otp-gateway';
import { OtpService } from './otp.service';

@Module({
  imports: [UsersModule, MailModule],
  providers: [
    OtpService,
    {
      provide: OtpGateway,
      useClass: LoggingOtpGateway,
    },
  ],
  exports: [OtpService],
})
export class OtpModule {}
