import { Module } from '@nestjs/common';
import { SessionRepository } from '../session.repository';
import { SessionRelationalRepository } from './repositories/session.repository';
import { PrismaModule } from '../../../../database/prisma.module';

@Module({
  imports: [PrismaModule],
  providers: [
    {
      provide: SessionRepository,
      useClass: SessionRelationalRepository,
    },
  ],
  exports: [SessionRepository],
})
export class RelationalSessionPersistenceModule {}
