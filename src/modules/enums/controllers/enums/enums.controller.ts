import { Controller, Get, Param } from '@nestjs/common';
import { ResponseDto } from 'src/common/dto/response.dto';
import { EnumsService } from '../../services/enums/enums.service';

@Controller('enums')
export class EnumsController {
  constructor(private readonly enumsService: EnumsService) {}

  @Get()
  getEnums() {
    const enums = this.enumsService.getEnums();
    return new ResponseDto(enums);
  }

  @Get(':tipo')
  getEnum(@Param('tipo') nombreEnum: string) {
    const enumValues = this.enumsService.getEnum(nombreEnum);
    return new ResponseDto(enumValues);
  }
}
