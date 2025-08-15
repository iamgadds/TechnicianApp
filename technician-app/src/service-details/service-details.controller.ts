import { Body, Controller, Post } from '@nestjs/common';
import { ServiceDetails, ServiceDetailsRequest } from 'src/dtos';
import { ServiceDetailsService } from './service-details.service';

@Controller()
export class ServiceDetailsController {
    constructor(private readonly serviceService: ServiceDetailsService) {}

  @Post('getServiceDetails')
  async getServiceDetails(@Body() request: ServiceDetailsRequest) {
    return this.serviceService.getServiceDetails(request);
  }

  @Post('saveServiceDetails')
  async saveServiceDetails(@Body() body: { data: ServiceDetails; mode: 'add' | 'update' | 'delete' }) {
    return this.serviceService.saveServiceDetails(body.data, body.mode);
  }
}
