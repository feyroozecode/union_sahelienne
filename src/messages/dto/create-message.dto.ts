import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, MaxLength, ValidateIf } from 'class-validator';

export class CreateMessageDto {
  @ApiPropertyOptional({ example: 'Salam, comment tu vas?', maxLength: 2000 })
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  content?: string;

  @ApiPropertyOptional({ example: '/uploads/photo.jpg' })
  @IsOptional()
  @IsString()
  imageUrl?: string;

  @ValidateIf((o: CreateMessageDto) => !o.content && !o.imageUrl)
  @IsString({ message: 'Either content or imageUrl must be provided' })
  _requireAtLeastOne?: string;
}
