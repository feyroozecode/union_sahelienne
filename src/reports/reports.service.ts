import {
  Injectable,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { ReportRepository } from './infrastructure/persistence/report.repository';
import { Report } from './domain/report';
import { CreateReportDto } from './dto/create-report.dto';

const REPORT_STATUS_PENDING = 'pending';
const REPORT_STATUS_REVIEWED = 'reviewed';
const REPORT_STATUS_DISMISSED = 'dismissed';

@Injectable()
export class ReportsService {
  constructor(private readonly reportRepository: ReportRepository) {}

  async createReport(
    reporterId: number,
    targetId: number,
    dto: CreateReportDto,
  ): Promise<Report> {
    if (reporterId === targetId) {
      throw new UnprocessableEntityException({
        status: 422,
        errors: { targetId: 'cannotReportSelf' },
      });
    }

    return this.reportRepository.create({
      reporterId,
      targetId,
      type: dto.type,
      description: dto.description ?? null,
      status: REPORT_STATUS_PENDING,
      reviewedBy: null,
      reviewedAt: null,
    });
  }

  findMyReports(reporterId: number): Promise<Report[]> {
    return this.reportRepository.findByReporterId(reporterId);
  }

  /** Admin: list all reports with optional status filter */
  findAll(filters?: { status?: string }): Promise<Report[]> {
    return this.reportRepository.findAll(filters);
  }

  /** Admin: mark report as reviewed */
  async reviewReport(id: number, adminUserId: number): Promise<Report> {
    const report = await this.reportRepository.findById(id);
    if (!report) {
      throw new NotFoundException({ status: 404, error: 'reportNotFound' });
    }
    const updated = await this.reportRepository.update(id, {
      status: REPORT_STATUS_REVIEWED,
      reviewedBy: adminUserId,
      reviewedAt: new Date(),
    });
    if (!updated) {
      throw new NotFoundException({ status: 404, error: 'reportNotFound' });
    }
    return updated;
  }

  /** Admin: dismiss report */
  async dismissReport(id: number, adminUserId: number): Promise<Report> {
    const report = await this.reportRepository.findById(id);
    if (!report) {
      throw new NotFoundException({ status: 404, error: 'reportNotFound' });
    }
    const updated = await this.reportRepository.update(id, {
      status: REPORT_STATUS_DISMISSED,
      reviewedBy: adminUserId,
      reviewedAt: new Date(),
    });
    if (!updated) {
      throw new NotFoundException({ status: 404, error: 'reportNotFound' });
    }
    return updated;
  }
}
