import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class QuerySubscriptionDto {
  @ApiPropertyOptional({ example: 'lite', description: 'Filter by tier' })
  @IsOptional()
  @IsString()
  tier?: string;

  @ApiPropertyOptional({ example: 'active', description: 'Filter by status' })
  @IsOptional()
  @IsString()
  status?: string;
}
