import { Module } from '@nestjs/common';
import { GenderBalanceService } from './gender-balance.service';
import { WaitlistService } from './waitlist.service';
import { DocumentUserPersistenceModule } from '../users/infrastructure/persistence/document/document-persistence.module';
import { RelationalUserPersistenceModule } from '../users/infrastructure/persistence/relational/relational-persistence.module';
import { DatabaseConfig } from '../database/config/database-config.type';
import databaseConfig from '../database/config/database.config';

// WaitlistService depends on UserRepository — import the same persistence module
// UsersModule uses, honouring the relational/document switch. Without this the
// app fails to boot: "Nest can't resolve dependencies of the WaitlistService".
// <database-block>
const infrastructurePersistenceModule = (databaseConfig() as DatabaseConfig)
  .isDocumentDatabase
  ? DocumentUserPersistenceModule
  : RelationalUserPersistenceModule;
// </database-block>

@Module({
  imports: [infrastructurePersistenceModule],
  providers: [WaitlistService, GenderBalanceService],
  exports: [WaitlistService, GenderBalanceService],
})
export class WaitlistModule {}
