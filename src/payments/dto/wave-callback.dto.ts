import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class WaveCallbackDto {
  @ApiProperty({
    example: 'WAVE-TXN-12345',
  })
  @IsString()
  waveRef: string;

  @ApiProperty({
    example: 'success',
  })
  @IsString()
  status: string;

  @ApiProperty({
    example: 25000,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  amount?: number;
}
