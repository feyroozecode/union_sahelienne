import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class Profile {
  @ApiProperty({
    type: Number,
  })
  id: number;

  @ApiProperty({
    type: Number,
  })
  userId: number;

  @ApiProperty({
    example: 'female',
  })
  gender: string;

  @ApiPropertyOptional({
    example: 29,
  })
  age?: number | null;

  @ApiPropertyOptional({
    example: 'Entrepreneur',
  })
  profession?: string | null;

  @ApiPropertyOptional({
    example: 'Single',
  })
  maritalStatus?: string | null;

  @ApiPropertyOptional({
    example: 0,
  })
  childrenCount?: number | null;

  @ApiPropertyOptional({
    example: 'Peulh',
  })
  ethnicity?: string | null;

  @ApiPropertyOptional({
    example: 'Niger',
  })
  country?: string | null;

  @ApiPropertyOptional({
    example: 'Niamey',
  })
  city?: string | null;

  @ApiPropertyOptional({
    example: 'O+',
  })
  bloodType?: string | null;

  @ApiPropertyOptional()
  hivTest?: boolean | null;

  @ApiPropertyOptional()
  hepatitisTest?: boolean | null;

  @ApiPropertyOptional({
    example: 25,
  })
  searchedAgeMin?: number | null;

  @ApiPropertyOptional({
    example: 35,
  })
  searchedAgeMax?: number | null;

  @ApiPropertyOptional({
    example: 'Single',
  })
  searchedMarital?: string | null;

  @ApiPropertyOptional({
    example: 'Serious, responsible, muslim',
  })
  searchedCriteria?: string | null;

  @ApiPropertyOptional()
  termsAcceptedAt?: Date | null;

  @ApiProperty()
  isComplete: boolean;

  @ApiProperty()
  isValidated: boolean;

  @ApiPropertyOptional({
    example: 'passport',
  })
  identityDocType?: string | null;

  @ApiPropertyOptional()
  identityDocPath?: string | null;

  @ApiProperty()
  isIdentityVerified: boolean;

  @ApiPropertyOptional({
    example: 'lite',
  })
  subscriptionType?: string | null;

  @ApiProperty({
    example: 3,
  })
  matchCreditsTotal: number;

  @ApiProperty({
    example: 0,
  })
  matchCreditsUsed: number;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}
