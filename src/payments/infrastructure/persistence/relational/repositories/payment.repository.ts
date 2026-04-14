import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../../../../database/prisma.service';
import { NullableType } from '../../../../../utils/types/nullable.type';
import { Payment } from '../../../../domain/payment';
import { PaymentRepository } from '../../payment.repository';
import { PaymentMapper } from '../mappers/payment.mapper';

@Injectable()
export class PaymentRelationalRepository implements PaymentRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: Payment): Promise<Payment> {
    const persistenceData = PaymentMapper.toPersistence(data);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { id: _, ...createData } =
      persistenceData as typeof persistenceData & {
        id?: never;
      };

    const entity = await this.prisma.payment.create({
      data: createData as Prisma.PaymentUncheckedCreateInput,
    });
    return PaymentMapper.toDomain(entity);
  }

  async findById(id: Payment['id']): Promise<NullableType<Payment>> {
    const entity = await this.prisma.payment.findUnique({
      where: { id: Number(id) },
    });
    return entity ? PaymentMapper.toDomain(entity) : null;
  }

  async findByWaveRef(waveRef: string): Promise<NullableType<Payment>> {
    const entity = await this.prisma.payment.findFirst({
      where: { waveRef },
    });
    return entity ? PaymentMapper.toDomain(entity) : null;
  }

  async findByUserId(userId: number): Promise<Payment[]> {
    const entities = await this.prisma.payment.findMany({
      where: { userId: Number(userId) },
      orderBy: { createdAt: 'desc' },
    });
    return entities.map((entity) => PaymentMapper.toDomain(entity));
  }

  async hasValidatedPayment(userId: number): Promise<boolean> {
    const payment = await this.prisma.payment.findFirst({
      where: {
        userId: Number(userId),
        status: 'validated',
      },
      select: {
        id: true,
      },
    });

    return Boolean(payment);
  }

  async update(id: Payment['id'], payload: Partial<Payment>): Promise<Payment> {
    const existing = await this.prisma.payment.findUnique({
      where: { id: Number(id) },
    });

    if (!existing) {
      throw new Error('Record not found');
    }

    const persistenceData = PaymentMapper.toPersistence({
      ...PaymentMapper.toDomain(existing),
      ...payload,
    });
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { id: _, ...updateData } =
      persistenceData as typeof persistenceData & {
        id?: never;
      };

    const entity = await this.prisma.payment.update({
      where: { id: Number(id) },
      data: updateData,
    });

    return PaymentMapper.toDomain(entity);
  }
}
