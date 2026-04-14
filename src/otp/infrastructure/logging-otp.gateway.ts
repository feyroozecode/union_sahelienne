import { Injectable, Logger } from '@nestjs/common';
import { OtpDeliveryPayload, OtpGateway } from '../otp-gateway';

@Injectable()
export class LoggingOtpGateway implements OtpGateway {
  private readonly logger = new Logger(LoggingOtpGateway.name);

  sendOtp(payload: OtpDeliveryPayload): Promise<void> {
    this.logger.log(`OTP dispatched to ${payload.to}: ${payload.message}`);
    return Promise.resolve();
  }
}
