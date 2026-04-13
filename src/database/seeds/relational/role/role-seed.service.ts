import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma.service';
import { RoleEnum } from '../../../../roles/roles.enum';

@Injectable()
export class RoleSeedService {
  constructor(private readonly prisma: PrismaService) {}

  async run() {
    await this.prisma.role.upsert({
      where: { id: RoleEnum.user },
      update: {},
      create: { id: RoleEnum.user, name: 'User' },
    });

    await this.prisma.role.upsert({
      where: { id: RoleEnum.admin },
      update: {},
      create: { id: RoleEnum.admin, name: 'Admin' },
    });
  }
}
