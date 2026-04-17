import {
  Controller,
  Get,
  Patch,
  Param,
  UseGuards,
  Query,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiParam,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { Roles } from '../roles/roles.decorator';
import { RoleEnum } from '../roles/roles.enum';
import { RolesGuard } from '../roles/roles.guard';
import { AdminService } from './admin.service';
import { QueryUserDto } from '../users/dto/query-user.dto';

@ApiTags('Admin')
@ApiBearerAuth()
@Roles(RoleEnum.admin)
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Controller({
  path: 'admin',
  version: '1',
})
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('dashboard')
  @ApiOkResponse({
    description: 'Dashboard KPIs and recent registrations chart data',
  })
  getDashboard() {
    return this.adminService.getDashboard();
  }

  @Get('stats')
  @ApiOkResponse({
    description: 'Platform statistics',
  })
  getStats() {
    return this.adminService.getStats();
  }

  @Get('payments/pending')
  @ApiOkResponse({
    description: 'List of pending payments awaiting admin validation',
  })
  getPendingPayments() {
    return this.adminService.getPendingPayments();
  }

  @Get('payments')
  @ApiOkResponse({
    description: 'List all payments',
  })
  getAllPayments() {
    return this.adminService.getAllPayments();
  }

  @Get('profiles')
  @ApiOkResponse({
    description: 'List profiles with optional filters',
  })
  @ApiQuery({ name: 'isIdentityVerified', required: false, type: Boolean })
  @ApiQuery({ name: 'isComplete', required: false, type: Boolean })
  @ApiQuery({ name: 'isValidated', required: false, type: Boolean })
  getProfiles(
    @Query('isIdentityVerified') isIdentityVerified?: string,
    @Query('isComplete') isComplete?: string,
    @Query('isValidated') isValidated?: string,
  ) {
    const filters: {
      isIdentityVerified?: boolean;
      isComplete?: boolean;
      isValidated?: boolean;
    } = {};
    if (isIdentityVerified !== undefined) {
      filters.isIdentityVerified = isIdentityVerified === 'true';
    }
    if (isComplete !== undefined) {
      filters.isComplete = isComplete === 'true';
    }
    if (isValidated !== undefined) {
      filters.isValidated = isValidated === 'true';
    }
    return this.adminService.getProfiles(filters);
  }

  @Get('matches')
  @ApiOkResponse({
    description: 'List all matches with optional status filter',
  })
  @ApiQuery({ name: 'status', required: false, type: String })
  getMatches(@Query('status') status?: string) {
    const filters = status ? { status } : undefined;
    return this.adminService.getMatches(filters);
  }

  @Get('users')
  @ApiOkResponse({
    description: 'List all users with filters',
  })
  getUsers(@Query() query: QueryUserDto) {
    return this.adminService.getUsers(query);
  }

  @Patch('profiles/:id/verify-identity')
  @ApiParam({ name: 'id', type: String, required: true })
  @ApiOkResponse({
    description: 'Mark identity document as verified',
  })
  verifyIdentity(@Param('id') id: string) {
    return this.adminService.verifyIdentity(Number(id));
  }
}
