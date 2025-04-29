import { Module } from '@nestjs/common';
import { EnumsController } from './controllers/enums/enums.controller';
import { EnumsService } from './services/enums/enums.service';

@Module({
  controllers: [EnumsController],
  providers: [EnumsService],
})
export class EnumsModule {}
