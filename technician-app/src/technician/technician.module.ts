import { Module } from '@nestjs/common';
import { TechnicianService } from './technician.service';
import { TechnicianController } from './technician.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Technician } from 'src/dtos';

@Module({
  imports: [TypeOrmModule.forFeature([Technician])],
  providers: [TechnicianService],
  controllers: [TechnicianController]
})
export class TechnicianModule {}
