import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, Matches, ValidateIf } from 'class-validator';
import { Transform } from 'class-transformer';
import { lowerCaseTransformer } from '../../utils/transformers/lower-case.transformer';

export class AuthForgotPasswordDto {
  @ApiPropertyOptional({ example: 'test1@example.com', type: String })
  @Transform(lowerCaseTransformer)
  @ValidateIf((object) => !object.phone)
  @IsNotEmpty()
  @IsEmail()
  email?: string;

  @ApiPropertyOptional({ example: '+22790000000', type: String })
  @ValidateIf((object) => !object.email)
  @IsNotEmpty()
  @Matches(/^\+?[1-9]\d{7,14}$/)
  phone?: string;
}
