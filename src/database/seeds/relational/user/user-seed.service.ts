import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma.service';
import bcrypt from 'bcryptjs';
import { RoleEnum } from '../../../../roles/roles.enum';
import { StatusEnum } from '../../../../statuses/statuses.enum';

@Injectable()
export class UserSeedService {
  constructor(private readonly prisma: PrismaService) {}

  async run() {
    const adminExists = await this.prisma.user.findFirst({
      where: { roleId: RoleEnum.admin, deletedAt: null },
    });

    if (!adminExists) {
      const salt = await bcrypt.genSalt();
      const password = await bcrypt.hash('secret', salt);

      await this.prisma.user.create({
        data: {
          firstName: 'Super',
          lastName: 'Admin',
          email: 'admin@example.com',
          password,
          provider: 'email',
          roleId: RoleEnum.admin,
          statusId: StatusEnum.active,
        },
      });
    }

    const userExists = await this.prisma.user.findFirst({
      where: { roleId: RoleEnum.user, deletedAt: null },
    });

    if (!userExists) {
      const salt = await bcrypt.genSalt();
      const password = await bcrypt.hash('secret', salt);

      await this.prisma.user.create({
        data: {
          firstName: 'John',
          lastName: 'Doe',
          email: 'john.doe@example.com',
          password,
          provider: 'email',
          roleId: RoleEnum.user,
          statusId: StatusEnum.active,
        },
      });
    }
  }
}
