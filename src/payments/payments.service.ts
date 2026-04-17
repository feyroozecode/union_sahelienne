import { Injectable, NotFoundException } from '@nestjs/common';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { PaymentRepository } from './infrastructure/persistence/payment.repository';
import { Payment } from './domain/payment';
import { FilesLocalService } from '../files/infrastructure/uploader/local/files.service';
import { AccountValidationService } from '../account-validation/account-validation.service';
import { InitiateWavePaymentDto } from './dto/initiate-wave-payment.dto';
import { WaveCallbackDto } from './dto/wave-callback.dto';
import { WaveInitiateResponseDto } from './dto/wave-initiate-response.dto';
import { ProfileRepository } from '../profiles/infrastructure/persistence/profile.repository';

const PAYMENT_TYPE_MANUAL = 'manual';
const PAYMENT_TYPE_WAVE = 'wave';
const PAYMENT_STATUS_PENDING = 'pending';
const PAYMENT_STATUS_VALIDATED = 'validated';
const PAYMENT_STATUS_REJECTED = 'rejected';
const SUBSCRIPTION_LITE = 'lite';
const LITE_MATCH_CREDITS = 3;

@Injectable()
export class PaymentsService {
  constructor(
    private readonly paymentRepository: PaymentRepository,
    private readonly filesLocalService: FilesLocalService,
    private readonly accountValidationService: AccountValidationService,
    private readonly profileRepository: ProfileRepository,
  ) {}

  async createManualPayment(
    userId: number,
    createPaymentDto: CreatePaymentDto,
    file: Express.Multer.File,
  ): Promise<Payment> {
    const uploadedFile = await this.filesLocalService.create(file);
    return this.paymentRepository.create({
      userId,
      type: PAYMENT_TYPE_MANUAL,
      status: PAYMENT_STATUS_PENDING,
      receiptPath: uploadedFile.file.path,
      waveRef: null,
      amount: createPaymentDto.amount ?? null,
      validatedAt: null,
      validatedBy: null,
    });
  }

  async initiateWavePayment(
    userId: number,
    dto: InitiateWavePaymentDto,
  ): Promise<WaveInitiateResponseDto> {
    const waveRef = dto.waveRef ?? `wave-${userId}-${Date.now().toString(36)}`;

    const payment = await this.paymentRepository.create({
      userId,
      type: PAYMENT_TYPE_WAVE,
      status: PAYMENT_STATUS_PENDING,
      receiptPath: null,
      waveRef,
      amount: dto.amount ?? null,
      validatedAt: null,
      validatedBy: null,
    });

    return {
      payment,
      depositNumber: process.env.WAVE_DEPOSIT_NUMBER ?? '',
      notice:
        process.env.WAVE_PAYMENT_NOTICE ??
        'Only account-to-account Wave deposits are accepted.',
    };
  }

  async handleWaveCallback(dto: WaveCallbackDto): Promise<Payment> {
    const payment = await this.paymentRepository.findByWaveRef(dto.waveRef);

    if (!payment) {
      throw new NotFoundException({
        status: 404,
        error: 'paymentNotFound',
      });
    }

    return this.paymentRepository.update(payment.id, {
      status:
        dto.status.toLowerCase() === 'success'
          ? PAYMENT_STATUS_PENDING
          : PAYMENT_STATUS_REJECTED,
      amount: dto.amount ?? payment.amount ?? null,
    }) as Promise<Payment>;
  }

  listMyPayments(userId: number) {
    return this.paymentRepository.findByUserId(userId);
  }

  async getMyPaymentStatus(
    userId: number,
  ): Promise<{ status: string; payment: Payment | null }> {
    const payments = await this.paymentRepository.findByUserId(userId);
    if (!payments.length) {
      return { status: 'none', payment: null };
    }
    const latest = payments[0];
    return { status: latest.status, payment: latest };
  }

  async validatePayment(
    id: Payment['id'],
    adminUserId: number,
  ): Promise<Payment> {
    const payment = await this.paymentRepository.findById(id);

    if (!payment) {
      throw new NotFoundException({
        status: 404,
        error: 'paymentNotFound',
      });
    }

    const updated = (await this.paymentRepository.update(id, {
      status: PAYMENT_STATUS_VALIDATED,
      validatedAt: new Date(),
      validatedBy: adminUserId,
    })) as Payment;

    await this.accountValidationService.syncProfileValidationState(
      payment.userId,
    );

    // Assign LITE subscription credits on first validated payment
    const profile = await this.profileRepository.findByUserId(payment.userId);
    if (profile && !profile.subscriptionType) {
      await this.profileRepository.update(profile.id, {
        subscriptionType: SUBSCRIPTION_LITE,
        matchCreditsTotal: LITE_MATCH_CREDITS,
      });
    }

    return updated;
  }

  async rejectPayment(id: Payment['id']): Promise<Payment> {
    const payment = await this.paymentRepository.findById(id);

    if (!payment) {
      throw new NotFoundException({
        status: 404,
        error: 'paymentNotFound',
      });
    }

    const updated = (await this.paymentRepository.update(id, {
      status: PAYMENT_STATUS_REJECTED,
      validatedAt: null,
      validatedBy: null,
    })) as Payment;

    await this.accountValidationService.syncProfileValidationState(
      payment.userId,
    );

    return updated;
  }
}
