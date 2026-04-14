import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, Matches } from 'class-validator';

export class AuthPhoneLoginDto {
  @ApiProperty({
    example: '+22790000000',
  })
  @IsNotEmpty()
  @Matches(/^\+?[1-9]\d{7,14}$/)
  phone: string;

  @ApiProperty()
  @IsNotEmpty()
  password: string;
}
