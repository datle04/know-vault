import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Query,
} from '@nestjs/common';
import { ArticlesService } from './articles.service.js';
import { SaveArticleDto } from './dto/save-article.dto.js';
import { ListArticlesQueryDto } from './dto/list-articles-query.dto.js';
import {
  CurrentUser,
  AuthenticatedUser,
} from '../../common/decorators/current-user.decorator.js';

@Controller('articles')
export class ArticlesController {
  constructor(private readonly articlesService: ArticlesService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  save(@Body() dto: SaveArticleDto, @CurrentUser() user: AuthenticatedUser) {
    return this.articlesService.save(dto, user.id);
  }

  @Get()
  findAll(
    @Query() query: ListArticlesQueryDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.articlesService.findAll(user.id, query);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @CurrentUser() user: AuthenticatedUser) {
    return this.articlesService.findOne(id, user.id);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  delete(@Param('id') id: string, @CurrentUser() user: AuthenticatedUser) {
    return this.articlesService.delete(id, user.id);
  }
}
