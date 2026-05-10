import { Report as PrismaReport } from '@prisma/client';
import { Report } from '../../../../domain/report';

export class ReportMapper {
  static toDomain(raw: PrismaReport): Report {
    const domain = new Report();
    domain.id = raw.id;
    domain.reporterId = raw.reporterId;
    domain.targetId = raw.targetId;
    domain.type = raw.type;
    domain.description = raw.description;
    domain.status = raw.status;
    domain.reviewedBy = raw.reviewedBy;
    domain.reviewedAt = raw.reviewedAt;
    domain.createdAt = raw.createdAt;
    domain.updatedAt = raw.updatedAt;
    return domain;
  }
}
