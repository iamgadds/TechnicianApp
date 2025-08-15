import { Body, Controller, Post } from '@nestjs/common';
import { TechnicianService } from './technician.service';
import { Technician, TechnicianDetailRequest } from 'src/dtos';

@Controller()
export class TechnicianController {
        constructor(private readonly technicianService: TechnicianService) {}

    @Post('getTechnicianDetails')
    async getTechnicianDetails(@Body() request: TechnicianDetailRequest) {
        return this.technicianService.getTechnicianDetails(request);
    }

    @Post('saveTechnicianDetails')
    async saveTechnicianDetails(@Body() body: { data: Technician; mode: 'add' | 'update' | 'delete' }) {
        return this.technicianService.saveTechnicianDetails(body.data, body.mode);
    }
}
