import { DeepPartial } from '../../../utils/types/deep-partial.type';
import { NullableType } from '../../../utils/types/nullable.type';
import { Match } from '../../domain/match';

export abstract class MatchRepository {
  abstract create(
    data: Omit<Match, 'id' | 'createdAt' | 'updatedAt'>,
  ): Promise<Match>;

  abstract findById(id: Match['id']): Promise<NullableType<Match>>;
  abstract findBetweenUsers(
    firstUserId: number,
    secondUserId: number,
  ): Promise<NullableType<Match>>;
  abstract countActiveByUserId(userId: number): Promise<number>;
  abstract findByUserId(userId: number): Promise<Match[]>;

  abstract update(
    id: Match['id'],
    payload: DeepPartial<Match>,
  ): Promise<Match | null>;
}
