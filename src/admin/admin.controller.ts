import {
  Controller,
  Get,
  Patch,
  Post,
  Param,
  Request,
  Body,
  SerializeOptions,
  UseGuards,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
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
import { User } from '../users/domain/user';
import { CreateAdminDto } from './dto/create-admin.dto';

@ApiTags('Admin')
@ApiBearerAuth()
@Roles(RoleEnum.admin)
@UseGuards(AuthGuard('jwt'), RolesGuard)
@SerializeOptions({ groups: ['admin'] })
@Controller({ path: 'admin', version: '1' })
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
  @ApiOkResponse({ description: 'Platform statistics' })
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
  @ApiOkResponse({ description: 'List all payments' })
  getAllPayments() {
    return this.adminService.getAllPayments();
  }

  @Get('profiles')
  @ApiOkResponse({ description: 'List profiles with optional filters' })
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
    if (isIdentityVerified !== undefined)
      filters.isIdentityVerified = isIdentityVerified === 'true';
    if (isComplete !== undefined) filters.isComplete = isComplete === 'true';
    if (isValidated !== undefined) filters.isValidated = isValidated === 'true';
    return this.adminService.getProfiles(filters);
  }

  @Get('matches')
  @ApiOkResponse({
    description: 'List all matches with optional status filter',
  })
  @ApiQuery({ name: 'status', required: false, type: String })
  getMatches(@Query('status') status?: string) {
    return this.adminService.getMatches(status ? { status } : undefined);
  }

  @Get('users')
  @ApiOkResponse({ description: 'List all users with filters' })
  getUsers(@Query() query: QueryUserDto) {
    return this.adminService.getUsers(query);
  }

  @Post('users')
  @ApiCreatedResponse({ description: 'Create a new admin user', type: User })
  @HttpCode(HttpStatus.CREATED)
  createAdmin(@Body() createAdminDto: CreateAdminDto): Promise<User> {
    return this.adminService.createAdmin(createAdminDto);
  }

  @Patch('profiles/:id/verify-identity')
  @ApiParam({ name: 'id', type: String, required: true })
  @ApiOkResponse({ description: 'Mark identity document as verified' })
  verifyIdentity(@Param('id') id: string) {
    return this.adminService.verifyIdentity(Number(id));
  }

  @Get('reports')
  @ApiOkResponse({ description: 'List all user reports' })
  @ApiQuery({ name: 'status', required: false, type: String })
  getReports(@Query('status') status?: string) {
    return this.adminService.getReports(status ? { status } : undefined);
  }

  @Patch('reports/:id/review')
  @ApiParam({ name: 'id', type: String, required: true })
  @ApiOkResponse({ description: 'Mark report as reviewed' })
  reviewReport(@Param('id') id: string, @Request() request) {
    return this.adminService.reviewReport(Number(id), request.user.id);
  }

  @Patch('reports/:id/dismiss')
  @ApiParam({ name: 'id', type: String, required: true })
  @ApiOkResponse({ description: 'Dismiss report' })
  dismissReport(@Param('id') id: string, @Request() request) {
    return this.adminService.dismissReport(Number(id), request.user.id);
  }

  @Get('subscriptions')
  @ApiOkResponse({ description: 'List all subscriptions' })
  @ApiQuery({ name: 'tier', required: false, type: String })
  @ApiQuery({ name: 'status', required: false, type: String })
  getSubscriptions(
    @Query('tier') tier?: string,
    @Query('status') status?: string,
  ) {
    const filters: { tier?: string; status?: string } = {};
    if (tier) filters.tier = tier;
    if (status) filters.status = status;
    return this.adminService.getSubscriptions(
      Object.keys(filters).length ? filters : undefined,
    );
  }

  @Get('waitlist')
  @ApiOkResponse({ description: 'List waitlisted users, oldest first' })
  @ApiQuery({
    name: 'gender',
    required: false,
    type: String,
    enum: ['male', 'female'],
  })
  listWaitlisted(@Query('gender') gender?: string) {
    const filter: { gender?: 'male' | 'female' } | undefined =
      gender === 'male' || gender === 'female' ? { gender } : undefined;
    return this.adminService.listWaitlisted(filter);
  }

  @Post('waitlist/:userId/unblock')
  @ApiParam({ name: 'userId', type: String, required: true })
  @ApiOkResponse({ description: 'Force-unblock a waitlisted user' })
  unblockWaitlisted(@Param('userId') userId: string) {
    return this.adminService.unblockWaitlisted(Number(userId));
  }
}
