import { Module } from '@nestjs/common';
import { RelationalPaymentPersistenceModule } from '../payments/infrastructure/persistence/relational/relational-persistence.module';
import { RelationalProfilePersistenceModule } from '../profiles/infrastructure/persistence/relational/relational-persistence.module';
import { AccountValidationService } from './account-validation.service';

@Module({
  imports: [
    RelationalProfilePersistenceModule,
    RelationalPaymentPersistenceModule,
  ],
  providers: [AccountValidationService],
  exports: [AccountValidationService],
})
export class AccountValidationModule {}
