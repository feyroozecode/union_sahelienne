import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class InitiateWavePaymentDto {
  @ApiPropertyOptional({
    example: 25000,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  amount?: number;

  @ApiPropertyOptional({
    example: 'WAVE-TXN-12345',
  })
  @IsOptional()
  @IsString()
  waveRef?: string;
}
