import { ApiProperty } from '@nestjs/swagger';
import { Payment } from '../domain/payment';

export class WaveInitiateResponseDto {
  @ApiProperty({
    type: () => Payment,
  })
  payment: Payment;

  @ApiProperty({
    example: '221771234567',
  })
  depositNumber: string;

  @ApiProperty({
    example: 'Only account-to-account Wave deposits are accepted.',
  })
  notice: string;
}
