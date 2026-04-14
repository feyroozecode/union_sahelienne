import { Module } from '@nestjs/common';
import { ProfileRepository } from '../profile.repository';
import { ProfileRelationalRepository } from './repositories/profile.repository';
import { PrismaModule } from '../../../../database/prisma.module';

@Module({
  imports: [PrismaModule],
  providers: [
    {
      provide: ProfileRepository,
      useClass: ProfileRelationalRepository,
    },
  ],
  exports: [ProfileRepository],
})
export class RelationalProfilePersistenceModule {}
