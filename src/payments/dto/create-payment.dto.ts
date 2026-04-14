import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsNumber, IsOptional, Min } from 'class-validator';

export class CreatePaymentDto {
  @ApiPropertyOptional({
    example: 25000,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  amount?: number;
}
