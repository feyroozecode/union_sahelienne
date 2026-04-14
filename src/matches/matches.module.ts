import { Module } from '@nestjs/common';
import { MatchesService } from './matches.service';
import { MatchesController } from './matches.controller';
import { RelationalMatchPersistenceModule } from './infrastructure/persistence/relational/relational-persistence.module';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [UsersModule, RelationalMatchPersistenceModule],
  controllers: [MatchesController],
  providers: [MatchesService],
  exports: [MatchesService, RelationalMatchPersistenceModule],
})
export class MatchesModule {}
