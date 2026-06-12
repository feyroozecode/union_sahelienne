import { Module } from '@nestjs/common';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { UsersModule } from '../users/users.module';
import { PaymentsModule } from '../payments/payments.module';
import { ProfilesModule } from '../profiles/profiles.module';
import { MatchesModule } from '../matches/matches.module';
import { PrismaModule } from '../database/prisma.module';
import { ReportsModule } from '../reports/reports.module';
import { RelationalSubscriptionPersistenceModule } from '../subscriptions/infrastructure/persistence/relational/relational-persistence.module';
import { WaitlistModule } from '../waitlist/waitlist.module';

@Module({
  imports: [
    UsersModule,
    PaymentsModule,
    ProfilesModule,
    MatchesModule,
    PrismaModule,
    ReportsModule,
    RelationalSubscriptionPersistenceModule,
    WaitlistModule,
  ],
  controllers: [AdminController],
  providers: [AdminService],
})
export class AdminModule {}
