import { Module } from '@nestjs/common';
import { GenderBalanceService } from './gender-balance.service';
import { WaitlistService } from './waitlist.service';

@Module({
  providers: [WaitlistService, GenderBalanceService],
  exports: [WaitlistService, GenderBalanceService],
})
export class WaitlistModule {}
