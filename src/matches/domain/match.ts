import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { User } from '../../users/domain/user';

export class Match {
  @ApiProperty({
    type: Number,
  })
  id: number;

  @ApiProperty({
    type: Number,
  })
  requesterId: number;

  @ApiProperty({
    type: Number,
  })
  targetId: number;

  @ApiProperty({
    example: '1:2',
  })
  pairKey: string;

  @ApiProperty({
    example: 'pending',
  })
  status: string;

  @ApiPropertyOptional()
  chatOpenedAt?: Date | null;

  @ApiPropertyOptional()
  chatExpiresAt?: Date | null;

  @ApiPropertyOptional()
  cooldownUntil?: Date | null;

  @ApiPropertyOptional({
    type: () => User,
  })
  requester?: User | null;

  @ApiPropertyOptional({
    type: () => User,
  })
  target?: User | null;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}
