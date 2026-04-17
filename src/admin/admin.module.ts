import { Module } from '@nestjs/common';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { UsersModule } from '../users/users.module';
import { PaymentsModule } from '../payments/payments.module';
import { ProfilesModule } from '../profiles/profiles.module';

@Module({
  imports: [UsersModule, PaymentsModule, ProfilesModule],
  controllers: [AdminController],
  providers: [AdminService],
})
export class AdminModule {}
