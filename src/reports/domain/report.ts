import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class Report {
  @ApiProperty({ type: Number })
  id: number;

  @ApiProperty({ type: Number })
  reporterId: number;

  @ApiProperty({ type: Number })
  targetId: number;

  @ApiProperty({
    example: 'suspect',
    description: 'suspect | harassment | scam | other',
  })
  type: string;

  @ApiPropertyOptional({ example: "Cette personne demande de l'argent..." })
  description?: string | null;

  @ApiProperty({
    example: 'pending',
    description: 'pending | reviewed | dismissed',
  })
  status: string;

  @ApiPropertyOptional({ type: Number })
  reviewedBy?: number | null;

  @ApiPropertyOptional()
  reviewedAt?: Date | null;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}
