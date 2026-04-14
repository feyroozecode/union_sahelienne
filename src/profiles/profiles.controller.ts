import {
  Controller,
  Get,
  Body,
  Put,
  Post,
  Request,
  UseGuards,
  SerializeOptions,
} from '@nestjs/common';
import { ProfilesService } from './profiles.service';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { ApiBearerAuth, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { Profile } from './domain/profile';
import { AuthGuard } from '@nestjs/passport';

@ApiTags('Profiles')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@Controller({
  path: 'profile',
  version: '1',
})
export class ProfilesController {
  constructor(private readonly profilesService: ProfilesService) {}

  @Get('me')
  @SerializeOptions({
    groups: ['me'],
  })
  @ApiOkResponse({
    type: Profile,
  })
  getMyProfile(@Request() request) {
    return this.profilesService.getMyProfile(request.user.id);
  }

  @Put('me')
  @SerializeOptions({
    groups: ['me'],
  })
  @ApiOkResponse({
    type: Profile,
  })
  updateMyProfile(
    @Request() request,
    @Body() updateProfileDto: UpdateProfileDto,
  ) {
    return this.profilesService.upsertMyProfile(
      request.user.id,
      updateProfileDto,
    );
  }

  @Post('me/terms')
  @SerializeOptions({
    groups: ['me'],
  })
  @ApiOkResponse({
    type: Profile,
  })
  acceptTerms(@Request() request) {
    return this.profilesService.acceptTerms(request.user.id);
  }
}
