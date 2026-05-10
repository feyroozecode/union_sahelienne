import { Module } from '@nestjs/common';
import { ReportRepository } from '../report.repository';
import { ReportRelationalRepository } from './repositories/report.repository';
import { PrismaModule } from '../../../../database/prisma.module';

@Module({
  imports: [PrismaModule],
  providers: [
    {
      provide: ReportRepository,
      useClass: ReportRelationalRepository,
    },
  ],
  exports: [ReportRepository],
})
export class RelationalReportPersistenceModule {}
