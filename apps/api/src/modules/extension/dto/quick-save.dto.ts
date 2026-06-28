import { IsUrl, IsString, IsOptional, MaxLength } from 'class-validator';

export class QuickSaveDto {
  @IsUrl({ require_protocol: true })
  url!: string;

  @IsString()
  @IsOptional()
  @MaxLength(500_000)
  html?: string;

  @IsString()
  @IsOptional()
  @MaxLength(10_000)
  selection?: string;

  @IsString()
  @IsOptional()
  @MaxLength(500)
  title?: string;
}
