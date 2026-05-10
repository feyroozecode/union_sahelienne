import { DeepPartial } from '../../../utils/types/deep-partial.type';
import { NullableType } from '../../../utils/types/nullable.type';
import { Report } from '../../domain/report';

export abstract class ReportRepository {
  abstract create(
    data: Omit<Report, 'id' | 'createdAt' | 'updatedAt'>,
  ): Promise<Report>;

  abstract findById(id: Report['id']): Promise<NullableType<Report>>;

  abstract findAll(filters?: { status?: string }): Promise<Report[]>;

  abstract findByReporterId(reporterId: number): Promise<Report[]>;

  abstract update(
    id: Report['id'],
    payload: DeepPartial<Report>,
  ): Promise<Report | null>;
}
