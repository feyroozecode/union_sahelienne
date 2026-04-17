import { DeepPartial } from '../../../utils/types/deep-partial.type';
import { NullableType } from '../../../utils/types/nullable.type';
import { Profile } from '../../domain/profile';

export abstract class ProfileRepository {
  abstract create(
    data: Omit<Profile, 'id' | 'createdAt' | 'updatedAt'>,
  ): Promise<Profile>;

  abstract findById(id: Profile['id']): Promise<NullableType<Profile>>;
  abstract findByUserId(
    userId: Profile['userId'],
  ): Promise<NullableType<Profile>>;

  abstract findAll(filters?: {
    isIdentityVerified?: boolean;
    isComplete?: boolean;
    isValidated?: boolean;
  }): Promise<Profile[]>;

  abstract count(filters?: {
    isValidated?: boolean;
    isIdentityVerified?: boolean;
    gender?: string;
  }): Promise<number>;

  abstract update(
    id: Profile['id'],
    payload: DeepPartial<Profile>,
  ): Promise<Profile | null>;
}
