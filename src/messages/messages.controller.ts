import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  Query,
  Request,
  UseGuards,
  Header,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiParam,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { MessagesService } from './messages.service';
import { CreateMessageDto } from './dto/create-message.dto';
import { Message } from './domain/message';

@ApiTags('Messages')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@Controller({ path: 'matches/:matchId/messages', version: '1' })
export class MessagesController {
  constructor(private readonly messagesService: MessagesService) {}

  @Post()
  @Header('X-Sensitive-Data', 'true')
  @ApiParam({ name: 'matchId', type: String, required: true })
  @ApiOkResponse({ type: Message })
  sendMessage(
    @Param('matchId') matchId: string,
    @Body() dto: CreateMessageDto,
    @Request() request: { user: { id: number } },
  ) {
    return this.messagesService.sendMessage(Number(matchId), request.user.id, dto);
  }

  @Get()
  @Header('X-Sensitive-Data', 'true')
  @ApiParam({ name: 'matchId', type: String, required: true })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'offset', required: false, type: Number })
  @ApiOkResponse({
    description: 'Paginated messages for a match',
    schema: {
      type: 'object',
      properties: {
        messages: { type: 'array', items: { $ref: '#/components/schemas/Message' } },
        total: { type: 'number' },
      },
    },
  })
  getMessages(
    @Param('matchId') matchId: string,
    @Request() request: { user: { id: number } },
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
  ) {
    return this.messagesService.getMessages(
      Number(matchId),
      request.user.id,
      limit ? Number(limit) : 50,
      offset ? Number(offset) : 0,
    );
  }
}
