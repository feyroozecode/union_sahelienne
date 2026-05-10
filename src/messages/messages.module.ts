import { Module } from '@nestjs/common';
import { MessagesService } from './messages.service';
import { MessagesController } from './messages.controller';
import { RelationalMessagePersistenceModule } from './infrastructure/persistence/relational/relational-persistence.module';
import { RelationalMatchPersistenceModule } from '../matches/infrastructure/persistence/relational/relational-persistence.module';

@Module({
  imports: [RelationalMessagePersistenceModule, RelationalMatchPersistenceModule],
  controllers: [MessagesController],
  providers: [MessagesService],
  exports: [MessagesService],
})
export class MessagesModule {}
