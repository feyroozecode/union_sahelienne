import { DeepPartial } from '../../../utils/types/deep-partial.type';
import { NullableType } from '../../../utils/types/nullable.type';
import { Payment } from '../../domain/payment';

export abstract class PaymentRepository {
  abstract create(
    data: Omit<Payment, 'id' | 'createdAt' | 'updatedAt'>,
  ): Promise<Payment>;

  abstract findById(id: Payment['id']): Promise<NullableType<Payment>>;
  abstract findByWaveRef(waveRef: string): Promise<NullableType<Payment>>;
  abstract findByUserId(userId: number): Promise<Payment[]>;
  abstract findPending(): Promise<Payment[]>;
  abstract hasValidatedPayment(userId: number): Promise<boolean>;

  abstract update(
    id: Payment['id'],
    payload: DeepPartial<Payment>,
  ): Promise<Payment | null>;
}
