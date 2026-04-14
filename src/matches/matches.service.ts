import {
  Injectable,
  ForbiddenException,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { MatchRepository } from './infrastructure/persistence/match.repository';
import { IPaginationOptions } from '../utils/types/pagination-options';
import { Match } from './domain/match';
import { UsersService } from '../users/users.service';
import { User } from '../users/domain/user';

const MATCH_STATUS_PENDING = 'pending';
const MATCH_STATUS_ACCEPTED = 'accepted';
const MATCH_STATUS_REJECTED = 'rejected';
const MAX_ACTIVE_MATCHES = 3;
const CHAT_WINDOW_DAYS = 30;

@Injectable()
export class MatchesService {
  constructor(
    private readonly matchRepository: MatchRepository,
    private readonly usersService: UsersService,
  ) {}

  async findCandidates(
    userId: number,
    paginationOptions: IPaginationOptions,
  ): Promise<User[]> {
    const viewer = await this.getValidatedUserWithProfile(userId);
    const oppositeGender =
      viewer.profile?.gender === 'male' ? 'female' : 'male';

    return this.usersService.findBrowseUsers({
      viewerId: userId,
      onlyValidated: true,
      gender: oppositeGender,
      paginationOptions,
    });
  }

  async sendInterest(requesterId: number, targetId: number): Promise<Match> {
    if (requesterId === targetId) {
      throw new UnprocessableEntityException({
        status: 422,
        errors: {
          targetId: 'cannotMatchSelf',
        },
      });
    }

    const requester = await this.getValidatedUserWithProfile(requesterId);
    const target = await this.getValidatedUserWithProfile(targetId);

    if (requester.profile?.gender === target.profile?.gender) {
      throw new UnprocessableEntityException({
        status: 422,
        errors: {
          targetId: 'candidateMustBeOppositeGender',
        },
      });
    }

    const activeMatches =
      await this.matchRepository.countActiveByUserId(requesterId);

    if (activeMatches >= MAX_ACTIVE_MATCHES) {
      throw new ForbiddenException({
        status: 403,
        error: 'activeMatchLimitReached',
      });
    }

    const existingMatch = await this.matchRepository.findBetweenUsers(
      requesterId,
      targetId,
    );

    if (existingMatch) {
      throw new UnprocessableEntityException({
        status: 422,
        errors: {
          targetId: 'matchAlreadyExists',
        },
      });
    }

    return this.matchRepository.create({
      requesterId,
      targetId,
      pairKey: [requesterId, targetId]
        .sort((left, right) => left - right)
        .join(':'),
      status: MATCH_STATUS_PENDING,
      chatOpenedAt: null,
      chatExpiresAt: null,
    });
  }

  async acceptMatch(matchId: number, currentUserId: number): Promise<Match> {
    const match = await this.getMatchOrThrow(matchId);

    if (match.targetId !== currentUserId) {
      throw new ForbiddenException({
        status: 403,
        error: 'onlyTargetCanAcceptMatch',
      });
    }

    await Promise.all([
      this.ensureAvailableMatchSlots(match.requesterId),
      this.ensureAvailableMatchSlots(match.targetId),
    ]);

    const now = new Date();
    const chatExpiresAt = new Date(
      now.getTime() + CHAT_WINDOW_DAYS * 24 * 60 * 60 * 1000,
    );

    return this.matchRepository.update(match.id, {
      status: MATCH_STATUS_ACCEPTED,
      chatOpenedAt: now,
      chatExpiresAt,
    }) as Promise<Match>;
  }

  async rejectMatch(matchId: number, currentUserId: number): Promise<Match> {
    const match = await this.getMatchOrThrow(matchId);

    if (match.targetId !== currentUserId) {
      throw new ForbiddenException({
        status: 403,
        error: 'onlyTargetCanRejectMatch',
      });
    }

    return this.matchRepository.update(match.id, {
      status: MATCH_STATUS_REJECTED,
      chatOpenedAt: null,
      chatExpiresAt: null,
    }) as Promise<Match>;
  }

  findMyMatches(userId: number) {
    return this.matchRepository
      .findByUserId(userId)
      .then((matches) =>
        matches.filter((match) => match.status === MATCH_STATUS_ACCEPTED),
      );
  }

  private async getMatchOrThrow(matchId: number): Promise<Match> {
    const match = await this.matchRepository.findById(matchId);

    if (!match) {
      throw new NotFoundException({
        status: 404,
        error: 'matchNotFound',
      });
    }

    return match;
  }

  private async ensureAvailableMatchSlots(userId: number): Promise<void> {
    const activeMatches =
      await this.matchRepository.countActiveByUserId(userId);

    if (activeMatches >= MAX_ACTIVE_MATCHES) {
      throw new ForbiddenException({
        status: 403,
        error: 'activeMatchLimitReached',
      });
    }
  }

  private async getValidatedUserWithProfile(userId: number): Promise<User> {
    const user = await this.usersService.findById(userId);

    if (!user || !user.profile) {
      throw new NotFoundException({
        status: 404,
        error: 'profileNotFound',
      });
    }

    if (!user.profile.isValidated) {
      throw new ForbiddenException({
        status: 403,
        error: 'validatedProfileRequired',
      });
    }

    return user;
  }
}
