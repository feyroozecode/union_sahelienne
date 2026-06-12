import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class OtpChallengeResponseDto {
  @ApiProperty({
    example: true,
  })
  requiresOtp: true;

  @ApiProperty({
    example: 'phone',
  })
  channel: 'email' | 'phone';

  @ApiProperty({
    example: '******1234',
  })
  target: string;

  @ApiProperty({
    example: 1760000000000,
  })
  expiresAt: number;

  @ApiPropertyOptional({
    description: 'OTP code (only returned in pre-beta mode for testing)',
    example: '123456',
  })
  code?: string;
}
