import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Request,
  UseGuards,
  Query,
} from '@nestjs/common';
import { MatchesService } from './matches.service';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { Match } from './domain/match';
import { AuthGuard } from '@nestjs/passport';
import {
  InfinityPaginationResponse,
  InfinityPaginationResponseDto,
} from '../utils/dto/infinity-pagination-response.dto';
import { infinityPagination } from '../utils/infinity-pagination';
import { FindAllMatchesDto } from './dto/find-all-matches.dto';
import { User } from '../users/domain/user';

@ApiTags('Matches')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@Controller({
  path: 'matches',
  version: '1',
})
export class MatchesController {
  constructor(private readonly matchesService: MatchesService) {}

  @Get('candidates')
  @ApiOkResponse({
    type: InfinityPaginationResponse(User),
  })
  async findCandidates(
    @Request() request,
    @Query() query: FindAllMatchesDto,
  ): Promise<InfinityPaginationResponseDto<User>> {
    const page = query?.page ?? 1;
    let limit = query?.limit ?? 10;

    if (limit > 50) {
      limit = 50;
    }

    return infinityPagination(
      await this.matchesService.findCandidates(request.user.id, {
        page,
        limit,
      }),
      { page, limit },
    );
  }

  @Post(':userId/interest')
  @ApiOkResponse({
    type: Match,
  })
  sendInterest(@Param('userId') userId: string, @Request() request) {
    return this.matchesService.sendInterest(request.user.id, Number(userId));
  }

  @Patch(':id/accept')
  @ApiOkResponse({
    type: Match,
  })
  acceptMatch(@Param('id') id: string, @Request() request) {
    return this.matchesService.acceptMatch(Number(id), request.user.id);
  }

  @Patch(':id/reject')
  @ApiParam({
    name: 'id',
    type: String,
    required: true,
  })
  @ApiOkResponse({
    type: Match,
  })
  rejectMatch(@Param('id') id: string, @Request() request) {
    return this.matchesService.rejectMatch(Number(id), request.user.id);
  }

  @Get('me')
  @ApiOkResponse({
    type: [Match],
  })
  findMyMatches(@Request() request) {
    return this.matchesService.findMyMatches(request.user.id);
  }
}
