import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard.js';
import {
  AuthenticatedUser,
  CurrentUser,
} from '../../common/decorators/current-user.decorator.js';
import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ExtensionService } from './extension.service.js';
import { QuickSaveDto } from './dto/quick-save.dto.js';

@UseGuards(JwtAuthGuard)
@Controller('extension')
export class ExtensionController {
  constructor(private readonly extensionService: ExtensionService) {}

  @Post('quick-save')
  async quickSave(
    @Body() dto: QuickSaveDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.extensionService.quickSave(dto, user.id);
  }

  @Get('check-url')
  async checkUrl(
    @Query('url') url: string,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<{ exists: boolean; articleId?: string; status?: string }> {
    if (!url) throw new BadRequestException({ errorCode: 'URL_REQUIRED' });
    return this.extensionService.checkUrl(url, user.id);
  }
}
