import { Module } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { PaymentsController } from './payments.controller';
import { RelationalPaymentPersistenceModule } from './infrastructure/persistence/relational/relational-persistence.module';
import { FilesLocalModule } from '../files/infrastructure/uploader/local/files.module';
import { AccountValidationModule } from '../account-validation/account-validation.module';
import { ProfilesModule } from '../profiles/profiles.module';
import { SubscriptionsModule } from '../subscriptions/subscriptions.module';
import { WaitlistModule } from '../waitlist/waitlist.module';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    FilesLocalModule,
    AccountValidationModule,
    RelationalPaymentPersistenceModule,
    ProfilesModule,
    SubscriptionsModule,
    WaitlistModule,
    UsersModule,
  ],
  controllers: [PaymentsController],
  providers: [PaymentsService],
  exports: [PaymentsService, RelationalPaymentPersistenceModule],
})
export class PaymentsModule {}
