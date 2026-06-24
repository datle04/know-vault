import {
  IsOptional,
  IsString,
  IsUrl,
  MaxLength,
  MinLength,
} from 'class-validator';

export class SaveArticleDto {
  @IsUrl()
  url!: string;

  @IsString()
  @MinLength(1)
  @MaxLength(500)
  title!: string;

  @IsString()
  @MinLength(1)
  @MaxLength(500000)
  content!: string;

  @IsString()
  @IsOptional()
  @MaxLength(200)
  author?: string;

  @IsString()
  @IsOptional()
  @MaxLength(200)
  siteName?: string;
}
