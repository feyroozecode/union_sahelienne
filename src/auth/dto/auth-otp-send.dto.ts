import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEmail,
  IsIn,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  ValidateIf,
} from 'class-validator';
import { Transform } from 'class-transformer';
import { lowerCaseTransformer } from '../../utils/transformers/lower-case.transformer';

export class AuthOtpSendDto {
  @ApiPropertyOptional({
    example: 'user@example.com',
  })
  @Transform(lowerCaseTransformer)
  @ValidateIf((object) => !object.phone)
  @IsNotEmpty()
  @IsEmail()
  email?: string;

  @ApiPropertyOptional({
    example: '+22790000000',
  })
  @ValidateIf((object) => !object.email)
  @IsNotEmpty()
  @Matches(/^\+?[1-9]\d{7,14}$/)
  phone?: string;

  @ApiPropertyOptional({
    example: 'phone',
  })
  @IsOptional()
  @IsString()
  @IsIn(['email', 'phone'])
  channel?: 'email' | 'phone';

  @ApiPropertyOptional({
    example: 'login',
  })
  @IsOptional()
  @IsString()
  @IsIn(['login', 'register', 'forgot-password'])
  purpose?: 'login' | 'register' | 'forgot-password';
}
