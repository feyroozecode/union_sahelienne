import { Controller, Get, Request, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { SubscriptionsService } from './subscriptions.service';
import { Subscription } from './domain/subscription';

@ApiTags('Subscriptions')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@Controller({ path: 'subscriptions', version: '1' })
export class SubscriptionsController {
  constructor(private readonly subscriptionsService: SubscriptionsService) {}

  @Get('me')
  @ApiOkResponse({
    type: Subscription,
    description: 'Active subscription for the authenticated user, or null',
  })
  getMyActiveSubscription(@Request() request: { user: { id: number } }) {
    return this.subscriptionsService.findActiveByUserId(request.user.id);
  }

  @Get('me/history')
  @ApiOkResponse({
    type: [Subscription],
    description: 'All subscriptions for the authenticated user',
  })
  getMySubscriptionHistory(@Request() request: { user: { id: number } }) {
    return this.subscriptionsService.findMySubscriptions(request.user.id);
  }

  @Get('me/credits')
  @ApiOkResponse({
    description: 'Available match credits for the authenticated user',
    schema: { type: 'object', properties: { available: { type: 'number' } } },
  })
  async getMyCredits(@Request() request: { user: { id: number } }) {
    const available = await this.subscriptionsService.getAvailableCredits(
      request.user.id,
    );
    return { available };
  }
}
