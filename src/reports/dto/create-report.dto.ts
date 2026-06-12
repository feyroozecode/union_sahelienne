import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString, MaxLength } from 'class-validator';

export enum ReportType {
  SUSPECT = 'suspect',
  HARASSMENT = 'harassment',
  SCAM = 'scam',
  OTHER = 'other',
}

export class CreateReportDto {
  @ApiProperty({ enum: ReportType, example: ReportType.SUSPECT })
  @IsEnum(ReportType)
  type: ReportType;

  @ApiPropertyOptional({
    example: "Cette personne demande de l'argent...",
    maxLength: 1000,
  })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  description?: string;
}
