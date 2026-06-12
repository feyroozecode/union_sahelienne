import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../../database/prisma.service';
import { NullableType } from '../../../../../utils/types/nullable.type';
import { Report } from '../../../../domain/report';
import { ReportRepository } from '../../report.repository';
import { ReportMapper } from '../mappers/report.mapper';

@Injectable()
export class ReportRelationalRepository implements ReportRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(
    data: Omit<Report, 'id' | 'createdAt' | 'updatedAt'>,
  ): Promise<Report> {
    const entity = await this.prisma.report.create({
      data: {
        reporterId: data.reporterId,
        targetId: data.targetId,
        type: data.type,
        description: data.description ?? null,
        status: data.status,
        reviewedBy: data.reviewedBy ?? null,
        reviewedAt: data.reviewedAt ?? null,
      },
    });
    return ReportMapper.toDomain(entity);
  }

  async findById(id: number): Promise<NullableType<Report>> {
    const entity = await this.prisma.report.findUnique({ where: { id } });
    return entity ? ReportMapper.toDomain(entity) : null;
  }

  async findAll(filters?: { status?: string }): Promise<Report[]> {
    const where: Record<string, unknown> = {};
    if (filters?.status) where.status = filters.status;
    const entities = await this.prisma.report.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });
    return entities.map(ReportMapper.toDomain);
  }

  async findByReporterId(reporterId: number): Promise<Report[]> {
    const entities = await this.prisma.report.findMany({
      where: { reporterId },
      orderBy: { createdAt: 'desc' },
    });
    return entities.map(ReportMapper.toDomain);
  }

  async update(id: number, payload: Partial<Report>): Promise<Report | null> {
    const existing = await this.prisma.report.findUnique({ where: { id } });
    if (!existing) return null;

    const entity = await this.prisma.report.update({
      where: { id },
      data: {
        ...(payload.status !== undefined ? { status: payload.status } : {}),
        ...(payload.reviewedBy !== undefined
          ? { reviewedBy: payload.reviewedBy }
          : {}),
        ...(payload.reviewedAt !== undefined
          ? { reviewedAt: payload.reviewedAt }
          : {}),
        ...(payload.description !== undefined
          ? { description: payload.description }
          : {}),
      },
    });
    return ReportMapper.toDomain(entity);
  }
}
