// src/admin/dto/create-admin.dto.ts
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  MinLength,
} from 'class-validator';
import { Transform } from 'class-transformer';
import { lowerCaseTransformer } from '../../utils/transformers/lower-case.transformer';

export class CreateAdminDto {
  @ApiProperty({ example: 'admin@example.com' })
  @Transform(lowerCaseTransformer)
  @IsNotEmpty()
  @IsEmail()
  email: string | null;

  @ApiProperty({ example: 'John' })
  @IsNotEmpty()
  @IsString()
  firstName: string | null;

  @ApiProperty({ example: 'Doe' })
  @IsNotEmpty()
  @IsString()
  lastName: string | null;

  @ApiPropertyOptional({ example: '+22790000000' })
  @IsOptional()
  @IsString()
  @Matches(/^\+?[1-9]\d{7,14}$/)
  phone?: string;

  @ApiProperty({ example: 'admin', description: 'Role ID' })
  @IsNotEmpty()
  @IsString()
  roles: string | null;
}