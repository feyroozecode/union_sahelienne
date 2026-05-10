import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class Message {
  @ApiProperty({ type: Number })
  id: number;

  @ApiProperty({ type: Number })
  matchId: number;

  @ApiProperty({ type: Number })
  senderId: number;

  @ApiPropertyOptional({ example: 'Salam, comment tu vas?' })
  content?: string | null;

  @ApiPropertyOptional({ example: '/uploads/photo.jpg' })
  imageUrl?: string | null;

  @ApiProperty()
  sentAt: Date;
}
