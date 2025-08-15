import { ConflictException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Technician, TechnicianDetailRequest } from 'src/dtos';
import { PagedResponse } from 'src/dtos/common';
import { Repository } from 'typeorm';

@Injectable()
export class TechnicianService {

    constructor(
        @InjectRepository(Technician)
        private readonly technicianRepo: Repository<Technician>,
      ) {}


      async getTechnicianDetails(request: TechnicianDetailRequest): Promise<Technician[]> {

        const { Page = 1, PageSize = 10 } = request;

        const queryBuilder = this.technicianRepo.createQueryBuilder('technician');
      
        if (request.TecId) {
          queryBuilder.andWhere('technician.TecId = :id', { id: request.TecId });
        }
      
        if (request.TechnicianName) {
          queryBuilder.andWhere('technician.Name LIKE :name', { name: `%${request.TechnicianName}%` });
        }
      
        if (request.PhoneNumber) {
          queryBuilder.andWhere('technician.MobileNumber LIKE :phone', { phone: `%${request.PhoneNumber}%` });
        }

        if (request.GetServiceCount) {
          queryBuilder.loadRelationCountAndMap('technician.TotalServices', 'technician.services');
        }

        queryBuilder.andWhere('technician.IsDeleted = :isDeleted', { isDeleted: false });
      
        return await queryBuilder
        .orderBy('technician.Name')
        .getMany();
        
      }


      async saveTechnicianDetails(data: Technician, mode: 'add' | 'update' | 'delete'): Promise<any> {
        if (mode === 'add') {
          // Check if mobile number already exists
          const existingTechnician = await this.technicianRepo.findOne({
            where: { MobileNumber: data.MobileNumber },
          });
      
          if (existingTechnician) {
            throw new ConflictException('A technician with this mobile number already exists.');
          }
      
          return this.technicianRepo.save(data);
        }
        if (mode === 'delete') return this.technicianRepo.delete(data.TecId);
      }
}
