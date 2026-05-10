import {
  Injectable,
  ForbiddenException,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { MessageRepository } from './infrastructure/persistence/message.repository';
import { MatchRepository } from '../matches/infrastructure/persistence/match.repository';
import { Message } from './domain/message';
import { CreateMessageDto } from './dto/create-message.dto';

@Injectable()
export class MessagesService {
  constructor(
    private readonly messageRepository: MessageRepository,
    private readonly matchRepository: MatchRepository,
  ) {}

  async sendMessage(
    matchId: number,
    senderId: number,
    dto: CreateMessageDto,
  ): Promise<Message> {
    if (!dto.content && !dto.imageUrl) {
      throw new UnprocessableEntityException({
        status: 422,
        errors: { message: 'contentOrImageRequired' },
      });
    }

    const match = await this.matchRepository.findById(matchId);

    if (!match) {
      throw new NotFoundException({ status: 404, error: 'matchNotFound' });
    }

    if (match.requesterId !== senderId && match.targetId !== senderId) {
      throw new ForbiddenException({
        status: 403,
        error: 'notParticipantOfMatch',
      });
    }

    if (match.status !== 'accepted') {
      throw new ForbiddenException({
        status: 403,
        error: 'chatRequiresAcceptedMatch',
      });
    }

    const now = new Date();
    if (match.chatExpiresAt && match.chatExpiresAt < now) {
      throw new ForbiddenException({
        status: 403,
        error: 'chatWindowExpired',
      });
    }

    return this.messageRepository.create({
      matchId,
      senderId,
      content: dto.content ?? null,
      imageUrl: dto.imageUrl ?? null,
    });
  }

  async getMessages(
    matchId: number,
    requesterId: number,
    limit = 50,
    offset = 0,
  ): Promise<{ messages: Message[]; total: number }> {
    const match = await this.matchRepository.findById(matchId);

    if (!match) {
      throw new NotFoundException({ status: 404, error: 'matchNotFound' });
    }

    if (match.requesterId !== requesterId && match.targetId !== requesterId) {
      throw new ForbiddenException({
        status: 403,
        error: 'notParticipantOfMatch',
      });
    }

    const [messages, total] = await Promise.all([
      this.messageRepository.findByMatchId(matchId, limit, offset),
      this.messageRepository.countByMatchId(matchId),
    ]);

    return { messages, total };
  }
}
