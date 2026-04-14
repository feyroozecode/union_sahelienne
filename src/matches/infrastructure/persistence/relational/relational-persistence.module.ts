import { Module } from '@nestjs/common';
import { MatchRepository } from '../match.repository';
import { MatchRelationalRepository } from './repositories/match.repository';
import { PrismaModule } from '../../../../database/prisma.module';

@Module({
  imports: [PrismaModule],
  providers: [
    {
      provide: MatchRepository,
      useClass: MatchRelationalRepository,
    },
  ],
  exports: [MatchRepository],
})
export class RelationalMatchPersistenceModule {}
