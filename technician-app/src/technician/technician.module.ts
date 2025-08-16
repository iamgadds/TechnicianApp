import { Module } from '@nestjs/common';
import { TechnicianService } from './technician.service';
import { TechnicianController } from './technician.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ServiceDetails, Technician } from 'src/dtos';

@Module({
  imports: [TypeOrmModule.forFeature([Technician]), TypeOrmModule.forFeature([ServiceDetails])],
  providers: [TechnicianService],
  controllers: [TechnicianController]
})
export class TechnicianModule {}
