import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../../database/prisma.service';
import { UserRepository } from '../../user.repository';
import { UserMapper } from '../mappers/user.mapper';
import { User } from '../../../../domain/user';
import { NullableType } from '../../../../../utils/types/nullable.type';
import { FilterUserDto, SortUserDto } from '../../../../dto/query-user.dto';
import { IPaginationOptions } from '../../../../../utils/types/pagination-options';

const USER_INCLUDE = { photo: true, role: true, status: true } as const;

@Injectable()
export class UsersRelationalRepository implements UserRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: User): Promise<User> {
    const entity = await this.prisma.user.create({
      data: UserMapper.toPersistence(data),
      include: USER_INCLUDE,
    });
    return UserMapper.toDomain(entity);
  }

  async findManyWithPagination({
    filterOptions,
    sortOptions,
    paginationOptions,
  }: {
    filterOptions?: FilterUserDto | null;
    sortOptions?: SortUserDto[] | null;
    paginationOptions: IPaginationOptions;
  }): Promise<User[]> {
    const where: Record<string, unknown> = { deletedAt: null };

    if (filterOptions?.roles?.length) {
      where.roleId = { in: filterOptions.roles.map((r) => Number(r.id)) };
    }

    const entities = await this.prisma.user.findMany({
      where,
      include: USER_INCLUDE,
      skip: (paginationOptions.page - 1) * paginationOptions.limit,
      take: paginationOptions.limit,
      orderBy: sortOptions?.map((s) => ({
        [s.orderBy]: s.order.toLowerCase(),
      })),
    });

    return entities.map((e) => UserMapper.toDomain(e));
  }

  async findById(id: User['id']): Promise<NullableType<User>> {
    const entity = await this.prisma.user.findFirst({
      where: { id: Number(id), deletedAt: null },
      include: USER_INCLUDE,
    });
    return entity ? UserMapper.toDomain(entity) : null;
  }

  async findByIds(ids: User['id'][]): Promise<User[]> {
    const entities = await this.prisma.user.findMany({
      where: { id: { in: ids.map(Number) }, deletedAt: null },
      include: USER_INCLUDE,
    });
    return entities.map((e) => UserMapper.toDomain(e));
  }

  async findByEmail(email: User['email']): Promise<NullableType<User>> {
    if (!email) return null;
    const entity = await this.prisma.user.findFirst({
      where: { email, deletedAt: null },
      include: USER_INCLUDE,
    });
    return entity ? UserMapper.toDomain(entity) : null;
  }

  async findBySocialIdAndProvider({
    socialId,
    provider,
  }: {
    socialId: User['socialId'];
    provider: User['provider'];
  }): Promise<NullableType<User>> {
    if (!socialId || !provider) return null;
    const entity = await this.prisma.user.findFirst({
      where: { socialId, provider, deletedAt: null },
      include: USER_INCLUDE,
    });
    return entity ? UserMapper.toDomain(entity) : null;
  }

  async update(id: User['id'], payload: Partial<User>): Promise<User> {
    const existing = await this.prisma.user.findFirst({
      where: { id: Number(id), deletedAt: null },
      include: USER_INCLUDE,
    });
    if (!existing) throw new Error('User not found');

    const merged = { ...UserMapper.toDomain(existing), ...payload };
    const persistenceData = UserMapper.toPersistence(merged);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { id: _, ...updateData } = {
      ...persistenceData,
    } as typeof persistenceData & { id: never };

    const entity = await this.prisma.user.update({
      where: { id: Number(id) },
      data: updateData,
      include: USER_INCLUDE,
    });
    return UserMapper.toDomain(entity);
  }

  async remove(id: User['id']): Promise<void> {
    await this.prisma.user.update({
      where: { id: Number(id) },
      data: { deletedAt: new Date() },
    });
  }
}
