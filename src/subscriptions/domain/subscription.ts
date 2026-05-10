import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class Subscription {
  @ApiProperty({ type: Number })
  id: number;

  @ApiProperty({ type: Number })
  userId: number;

  @ApiProperty({ example: 'lite' })
  tier: string;

  @ApiProperty({ example: 2 })
  creditsGranted: number;

  @ApiProperty({ example: 1 })
  creditsBonus: number;

  @ApiProperty({ example: 0 })
  creditsUsed: number;

  @ApiProperty({ example: 'active' })
  status: string;

  @ApiPropertyOptional()
  expiresAt?: Date | null;

  @ApiPropertyOptional()
  bonusExpiresAt?: Date | null;

  @ApiPropertyOptional({ type: Number })
  paymentId?: number | null;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}
