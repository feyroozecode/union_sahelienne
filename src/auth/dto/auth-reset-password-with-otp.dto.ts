import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, MinLength } from 'class-validator';
import { AuthOtpSendDto } from './auth-otp-send.dto';

export class AuthResetPasswordWithOtpDto extends AuthOtpSendDto {
  @ApiProperty({
    example: '123456',
  })
  @IsNotEmpty()
  otp: string;

  @ApiProperty()
  @IsNotEmpty()
  @MinLength(6)
  password: string;
}
