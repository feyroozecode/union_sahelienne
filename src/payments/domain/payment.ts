import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class Payment {
  @ApiProperty({
    type: Number,
  })
  id: number;

  @ApiProperty({
    type: Number,
  })
  userId: number;

  @ApiProperty({
    example: 'manual',
  })
  type: string;

  @ApiProperty({
    example: 'pending',
  })
  status: string;

  @ApiPropertyOptional({
    example: '/api/v1/files/receipt.png',
  })
  receiptPath?: string | null;

  @ApiPropertyOptional({
    example: 'wave-12345',
  })
  waveRef?: string | null;

  @ApiPropertyOptional({
    example: 25000,
  })
  amount?: number | null;

  @ApiPropertyOptional()
  validatedAt?: Date | null;

  @ApiPropertyOptional({
    example: 1,
  })
  validatedBy?: number | null;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}
