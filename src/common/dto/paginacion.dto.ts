import { IsNumber, IsOptional } from 'class-validator';

export class PaginacionDto {
  @IsNumber()
  @IsOptional()
  pagina?: number = 1;

  @IsNumber()
  @IsOptional()
  size?: number = 10;
}
