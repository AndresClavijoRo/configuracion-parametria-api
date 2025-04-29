import { Module } from '@nestjs/common';
import { ModuloController } from './controllers/modulo/modulo.controller';
import { ModuloService } from './services/modulo/modulo.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Modulo, ModuloSchema } from './schemas/modulo.schema';

@Module({
  imports: [MongooseModule.forFeature([{ name: Modulo.name, schema: ModuloSchema }])],
  controllers: [ModuloController],
  providers: [ModuloService],
  exports: [ModuloService],
})
export class ModuloModule {}
