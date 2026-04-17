import {
  Controller,
  Post,
  Body,
  Patch,
  Param,
  Get,
  Request,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOkResponse,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { Payment } from './domain/payment';
import { AuthGuard } from '@nestjs/passport';
import { FileInterceptor } from '@nestjs/platform-express';
import { Roles } from '../roles/roles.decorator';
import { RoleEnum } from '../roles/roles.enum';
import { RolesGuard } from '../roles/roles.guard';
import { InitiateWavePaymentDto } from './dto/initiate-wave-payment.dto';
import { WaveCallbackDto } from './dto/wave-callback.dto';
import { WaveInitiateResponseDto } from './dto/wave-initiate-response.dto';

@ApiTags('Payments')
@Controller({
  path: 'payments',
  version: '1',
})
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @Post('manual')
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
        amount: {
          type: 'number',
        },
      },
    },
  })
  @UseInterceptors(FileInterceptor('file'))
  @ApiOkResponse({
    type: Payment,
  })
  createManualPayment(
    @Request() request,
    @Body() createPaymentDto: CreatePaymentDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.paymentsService.createManualPayment(
      request.user.id,
      createPaymentDto,
      file,
    );
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @Post('wave/initiate')
  @ApiOkResponse({
    type: WaveInitiateResponseDto,
  })
  initiateWavePayment(@Request() request, @Body() dto: InitiateWavePaymentDto) {
    return this.paymentsService.initiateWavePayment(request.user.id, dto);
  }

  @Post('wave/callback')
  @ApiOkResponse({
    type: Payment,
  })
  handleWaveCallback(@Body() dto: WaveCallbackDto) {
    return this.paymentsService.handleWaveCallback(dto);
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @Get('me')
  @ApiOkResponse({
    type: [Payment],
  })
  listMyPayments(@Request() request) {
    return this.paymentsService.listMyPayments(request.user.id);
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @Get('me/status')
  getMyPaymentStatus(@Request() request) {
    return this.paymentsService.getMyPaymentStatus(request.user.id);
  }

  @ApiBearerAuth()
  @Roles(RoleEnum.admin)
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Patch(':id/validate')
  @ApiParam({
    name: 'id',
    type: String,
    required: true,
  })
  @ApiOkResponse({
    type: Payment,
  })
  validatePayment(@Param('id') id: string, @Request() request) {
    return this.paymentsService.validatePayment(Number(id), request.user.id);
  }

  @ApiBearerAuth()
  @Roles(RoleEnum.admin)
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Patch(':id/reject')
  @ApiParam({
    name: 'id',
    type: String,
    required: true,
  })
  @ApiOkResponse({
    type: Payment,
  })
  rejectPayment(@Param('id') id: string) {
    return this.paymentsService.rejectPayment(Number(id));
  }
}
