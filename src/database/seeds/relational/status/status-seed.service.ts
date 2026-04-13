import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma.service';
import { StatusEnum } from '../../../../statuses/statuses.enum';

@Injectable()
export class StatusSeedService {
  constructor(private readonly prisma: PrismaService) {}

  async run() {
    await this.prisma.status.upsert({
      where: { id: StatusEnum.active },
      update: {},
      create: { id: StatusEnum.active, name: 'Active' },
    });

    await this.prisma.status.upsert({
      where: { id: StatusEnum.inactive },
      update: {},
      create: { id: StatusEnum.inactive, name: 'Inactive' },
    });
  }
}
