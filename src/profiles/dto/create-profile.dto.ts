import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsDateString,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';

export class CreateProfileDto {
  @ApiProperty({
    example: 'female',
  })
  @IsString()
  @IsNotEmpty()
  gender: string;

  @ApiPropertyOptional({
    example: 29,
  })
  @IsOptional()
  @IsInt()
  @Min(18)
  @Max(120)
  age?: number;

  @ApiPropertyOptional({
    example: 'Entrepreneur',
  })
  @IsOptional()
  @IsString()
  profession?: string;

  @ApiPropertyOptional({
    example: 'Single',
  })
  @IsOptional()
  @IsString()
  maritalStatus?: string;

  @ApiPropertyOptional({
    example: 0,
  })
  @IsOptional()
  @IsInt()
  @Min(0)
  childrenCount?: number;

  @ApiPropertyOptional({
    example: 'Peulh',
  })
  @IsOptional()
  @IsString()
  ethnicity?: string;

  @ApiPropertyOptional({
    example: 'Niger',
  })
  @IsOptional()
  @IsString()
  country?: string;

  @ApiPropertyOptional({
    example: 'Niamey',
  })
  @IsOptional()
  @IsString()
  city?: string;

  @ApiPropertyOptional({
    example: 'O+',
  })
  @IsOptional()
  @IsString()
  bloodType?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  hivTest?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  hepatitisTest?: boolean;

  @ApiPropertyOptional({
    example: 25,
  })
  @IsOptional()
  @IsInt()
  @Min(18)
  searchedAgeMin?: number;

  @ApiPropertyOptional({
    example: 35,
  })
  @IsOptional()
  @IsInt()
  @Min(18)
  searchedAgeMax?: number;

  @ApiPropertyOptional({
    example: 'Single',
  })
  @IsOptional()
  @IsString()
  searchedMarital?: string;

  @ApiPropertyOptional({
    example: 'Serious, responsible, muslim',
  })
  @IsOptional()
  @IsString()
  searchedCriteria?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  termsAcceptedAt?: string;
}
