import { DeepPartial } from '../../../utils/types/deep-partial.type';
import { NullableType } from '../../../utils/types/nullable.type';
import { Subscription } from '../../domain/subscription';

export abstract class SubscriptionRepository {
  abstract create(
    data: Omit<Subscription, 'id' | 'createdAt' | 'updatedAt'>,
  ): Promise<Subscription>;

  abstract findById(
    id: Subscription['id'],
  ): Promise<NullableType<Subscription>>;

  abstract findActiveByUserId(
    userId: number,
  ): Promise<NullableType<Subscription>>;

  abstract findByUserId(userId: number): Promise<Subscription[]>;

  abstract findAll(filters?: {
    tier?: string;
    status?: string;
  }): Promise<Subscription[]>;

  abstract update(
    id: Subscription['id'],
    payload: DeepPartial<Subscription>,
  ): Promise<Subscription | null>;
}
