import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';
import { AuthOtpSendDto } from './auth-otp-send.dto';

export class AuthOtpVerifyDto extends AuthOtpSendDto {
  @ApiProperty({
    example: '123456',
  })
  @IsNotEmpty()
  otp: string;
}
