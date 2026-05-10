import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  Request,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { ReportsService } from './reports.service';
import { CreateReportDto } from './dto/create-report.dto';
import { Report } from './domain/report';

@ApiTags('Reports')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@Controller({ path: 'reports', version: '1' })
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Post(':targetId')
  @ApiParam({ name: 'targetId', type: String, required: true })
  @ApiOkResponse({ type: Report })
  createReport(
    @Param('targetId') targetId: string,
    @Body() dto: CreateReportDto,
    @Request() request: { user: { id: number } },
  ) {
    return this.reportsService.createReport(
      request.user.id,
      Number(targetId),
      dto,
    );
  }

  @Get('me')
  @ApiOkResponse({ type: [Report] })
  getMyReports(@Request() request: { user: { id: number } }) {
    return this.reportsService.findMyReports(request.user.id);
  }
}
