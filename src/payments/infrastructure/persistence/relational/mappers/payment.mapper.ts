import { Payment as PrismaPayment } from '@prisma/client';
import { Payment } from '../../../../domain/payment';

export class PaymentMapper {
  static toDomain(raw: PrismaPayment): Payment {
    const domainEntity = new Payment();
    domainEntity.id = raw.id;
    domainEntity.userId = raw.userId;
    domainEntity.type = raw.type;
    domainEntity.status = raw.status;
    domainEntity.receiptPath = raw.receiptPath;
    domainEntity.waveRef = raw.waveRef;
    domainEntity.amount = raw.amount;
    domainEntity.validatedAt = raw.validatedAt;
    domainEntity.validatedBy = raw.validatedBy;
    domainEntity.createdAt = raw.createdAt;
    domainEntity.updatedAt = raw.updatedAt;
    return domainEntity;
  }

  static toPersistence(domainEntity: Partial<Payment>) {
    return {
      ...(domainEntity.id ? { id: domainEntity.id } : {}),
      ...(domainEntity.userId ? { userId: domainEntity.userId } : {}),
      ...(domainEntity.type !== undefined ? { type: domainEntity.type } : {}),
      ...(domainEntity.status !== undefined
        ? { status: domainEntity.status }
        : {}),
      ...(domainEntity.receiptPath !== undefined
        ? { receiptPath: domainEntity.receiptPath }
        : {}),
      ...(domainEntity.waveRef !== undefined
        ? { waveRef: domainEntity.waveRef }
        : {}),
      ...(domainEntity.amount !== undefined
        ? { amount: domainEntity.amount }
        : {}),
      ...(domainEntity.validatedAt !== undefined
        ? { validatedAt: domainEntity.validatedAt }
        : {}),
      ...(domainEntity.validatedBy !== undefined
        ? { validatedBy: domainEntity.validatedBy }
        : {}),
      ...(domainEntity.createdAt ? { createdAt: domainEntity.createdAt } : {}),
      ...(domainEntity.updatedAt ? { updatedAt: domainEntity.updatedAt } : {}),
    };
  }
}
