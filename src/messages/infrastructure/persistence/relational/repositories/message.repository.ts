import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../../database/prisma.service';
import { NullableType } from '../../../../../utils/types/nullable.type';
import { Message } from '../../../../domain/message';
import { MessageRepository } from '../../message.repository';
import { MessageMapper } from '../mappers/message.mapper';

@Injectable()
export class MessageRelationalRepository implements MessageRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: Omit<Message, 'id' | 'sentAt'>): Promise<Message> {
    const entity = await this.prisma.message.create({
      data: {
        matchId: data.matchId,
        senderId: data.senderId,
        content: data.content ?? null,
        imageUrl: data.imageUrl ?? null,
      },
    });
    return MessageMapper.toDomain(entity);
  }

  async findById(id: number): Promise<NullableType<Message>> {
    const entity = await this.prisma.message.findUnique({ where: { id } });
    return entity ? MessageMapper.toDomain(entity) : null;
  }

  async findByMatchId(
    matchId: number,
    limit = 50,
    offset = 0,
  ): Promise<Message[]> {
    const entities = await this.prisma.message.findMany({
      where: { matchId },
      orderBy: { sentAt: 'asc' },
      take: limit,
      skip: offset,
    });
    return entities.map(MessageMapper.toDomain);
  }

  async countByMatchId(matchId: number): Promise<number> {
    return this.prisma.message.count({ where: { matchId } });
  }
}
