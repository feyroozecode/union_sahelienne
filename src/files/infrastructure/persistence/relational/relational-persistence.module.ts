import { Module } from '@nestjs/common';
import { FileRepository } from '../file.repository';
import { FileRelationalRepository } from './repositories/file.repository';
import { PrismaModule } from '../../../../database/prisma.module';

@Module({
  imports: [PrismaModule],
  providers: [
    {
      provide: FileRepository,
      useClass: FileRelationalRepository,
    },
  ],
  exports: [FileRepository],
})
export class RelationalFilePersistenceModule {}
