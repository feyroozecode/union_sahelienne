import { Module } from '@nestjs/common';
import { PaymentRepository } from '../payment.repository';
import { PaymentRelationalRepository } from './repositories/payment.repository';
import { PrismaModule } from '../../../../database/prisma.module';

@Module({
  imports: [PrismaModule],
  providers: [
    {
      provide: PaymentRepository,
      useClass: PaymentRelationalRepository,
    },
  ],
  exports: [PaymentRepository],
})
export class RelationalPaymentPersistenceModule {}
