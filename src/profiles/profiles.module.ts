import { Module } from '@nestjs/common';
import { ProfilesService } from './profiles.service';
import { ProfilesController } from './profiles.controller';
import { RelationalProfilePersistenceModule } from './infrastructure/persistence/relational/relational-persistence.module';
import { UsersModule } from '../users/users.module';
import { AccountValidationModule } from '../account-validation/account-validation.module';

@Module({
  imports: [
    UsersModule,
    AccountValidationModule,
    RelationalProfilePersistenceModule,
  ],
  controllers: [ProfilesController],
  providers: [ProfilesService],
  exports: [ProfilesService, RelationalProfilePersistenceModule],
})
export class ProfilesModule {}
