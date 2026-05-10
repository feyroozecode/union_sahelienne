import { Message as PrismaMessage } from '@prisma/client';
import { Message } from '../../../../domain/message';

export class MessageMapper {
  static toDomain(raw: PrismaMessage): Message {
    const domain = new Message();
    domain.id = raw.id;
    domain.matchId = raw.matchId;
    domain.senderId = raw.senderId;
    domain.content = raw.content;
    domain.imageUrl = raw.imageUrl;
    domain.sentAt = raw.sentAt;
    return domain;
  }
}
