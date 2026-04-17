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
