import { NullableType } from '../../../utils/types/nullable.type';
import { Message } from '../../domain/message';

export abstract class MessageRepository {
  abstract create(
    data: Omit<Message, 'id' | 'sentAt'>,
  ): Promise<Message>;

  abstract findById(id: Message['id']): Promise<NullableType<Message>>;

  abstract findByMatchId(matchId: number, limit?: number, offset?: number): Promise<Message[]>;

  abstract countByMatchId(matchId: number): Promise<number>;
}
