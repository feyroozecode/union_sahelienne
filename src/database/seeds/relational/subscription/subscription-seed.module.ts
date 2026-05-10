import { Module } from '@nestjs/common';
import { SubscriptionSeedService } from './subscription-seed.service';
import { PrismaModule } from '../../../prisma.module';

@Module({
  imports: [PrismaModule],
  providers: [SubscriptionSeedService],
  exports: [SubscriptionSeedService],
})
export class SubscriptionSeedModule {}
