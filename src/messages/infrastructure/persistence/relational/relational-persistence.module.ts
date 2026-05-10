import { Module } from '@nestjs/common';
import { MessageRepository } from '../message.repository';
import { MessageRelationalRepository } from './repositories/message.repository';
import { PrismaModule } from '../../../../database/prisma.module';

@Module({
  imports: [PrismaModule],
  providers: [
    {
      provide: MessageRepository,
      useClass: MessageRelationalRepository,
    },
  ],
  exports: [MessageRepository],
})
export class RelationalMessagePersistenceModule {}
