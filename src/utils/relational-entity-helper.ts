import { instanceToPlain } from 'class-transformer';

export class EntityRelationalHelper {
  __entity?: string;

  toJSON() {
    return instanceToPlain(this);
  }
}
