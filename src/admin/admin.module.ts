import { Module } from '@nestjs/common';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { UsersModule } from '../users/users.module';
import { PaymentsModule } from '../payments/payments.module';
import { ProfilesModule } from '../profiles/profiles.module';
import { MatchesModule } from '../matches/matches.module';
import { PrismaModule } from '../database/prisma.module';

@Module({
  imports: [
    UsersModule,
    PaymentsModule,
    ProfilesModule,
    MatchesModule,
    PrismaModule,
  ],
  controllers: [AdminController],
  providers: [AdminService],
})
export class AdminModule {}
