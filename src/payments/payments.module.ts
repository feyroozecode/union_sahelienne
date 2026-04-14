import { Module } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { PaymentsController } from './payments.controller';
import { RelationalPaymentPersistenceModule } from './infrastructure/persistence/relational/relational-persistence.module';
import { FilesLocalModule } from '../files/infrastructure/uploader/local/files.module';
import { AccountValidationModule } from '../account-validation/account-validation.module';

@Module({
  imports: [
    FilesLocalModule,
    AccountValidationModule,
    RelationalPaymentPersistenceModule,
  ],
  controllers: [PaymentsController],
  providers: [PaymentsService],
  exports: [PaymentsService, RelationalPaymentPersistenceModule],
})
export class PaymentsModule {}
