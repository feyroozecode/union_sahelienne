import { Module } from '@nestjs/common';
import { SubscriptionRepository } from '../subscription.repository';
import { SubscriptionRelationalRepository } from './repositories/subscription.repository';
import { PrismaModule } from '../../../../database/prisma.module';

@Module({
  imports: [PrismaModule],
  providers: [
    {
      provide: SubscriptionRepository,
      useClass: SubscriptionRelationalRepository,
    },
  ],
  exports: [SubscriptionRepository],
})
export class RelationalSubscriptionPersistenceModule {}
