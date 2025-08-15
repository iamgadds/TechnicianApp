import { Module } from '@nestjs/common';
import { ServiceDetailsService } from './service-details.service';
import { ServiceDetailsController } from './service-details.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ServiceDetails } from 'src/dtos';

@Module({
  imports: [TypeOrmModule.forFeature([ServiceDetails])],
  providers: [ServiceDetailsService],
  controllers: [ServiceDetailsController]
})
export class ServiceDetailsModule {}
