import { ConflictException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ServiceDetails, Technician, TechnicianDetailRequest } from 'src/dtos';
import { PagedResponse } from 'src/dtos/common';
import { ServiceStatusEnum } from 'src/lib';
import { EntityManager, Repository } from 'typeorm';
import { QueryFailedError } from 'typeorm';
;

@Injectable()
export class TechnicianService {

    constructor(
        @InjectRepository(Technician)
        private readonly technicianRepo: Repository<Technician>,
        @InjectRepository(ServiceDetails)
        private readonly serviceDetailsRepo: Repository<ServiceDetails>
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

          // total *resolved* services
          queryBuilder.loadRelationCountAndMap(
            'technician.ResolvedServices',          // ← property added to result
            'technician.services',                  // ← relation to count on
            'service',                              // ← alias for the joined table
            subQb =>
              subQb.andWhere('service.Status = :status', {
                status: ServiceStatusEnum.RESOLVED, // ⇽ enum value
              }),
          );
        }

        queryBuilder.andWhere('technician.IsDeleted = :isDeleted', { isDeleted: false });
      
        return await queryBuilder
        .orderBy('technician.Name')
        .getMany();
        
      }

async saveTechnicianDetails(data: Technician, mode: 'add' | 'update' | 'delete'): Promise<any> {
  try {
    if (mode === 'add') {
      // Check if mobile number already exists (excluding soft-deleted records)
      const existingTechnician = await this.technicianRepo.findOne({
        where: { 
          MobileNumber: data.MobileNumber,
          IsDeleted: false
        },
      });

      if (existingTechnician) {
        throw new ConflictException('A technician with this mobile number already exists.');
      }

      return this.technicianRepo.save({
        ...data,
        deleted: false,
        createdAt: new Date(),
        updatedAt: new Date()
      });
    }

    if (mode === 'update') {
      // Check if mobile number exists for a different technician
      const existingTechnician = await this.technicianRepo.findOne({
        where: { 
          MobileNumber: data.MobileNumber,
          IsDeleted: false
        },
      });

      if (existingTechnician && existingTechnician.TecId !== data.TecId) {
        throw new ConflictException('Mobile number already exists for another technician.');
      }

      return await this.technicianRepo.save({
        ...data,
        updatedAt: new Date()
      });
    }

    if (mode === 'delete') {
  return this.technicianRepo.manager.transaction(async (manager: EntityManager) => {
    // Delete related service details first
    await manager.delete(ServiceDetails, { TecId: data.TecId });

    // Then delete the technician
    await manager.delete(Technician, data.TecId);
  });
}
  } catch (error) {
    // Handle database constraint errors
    if (error instanceof QueryFailedError) {
      if (error.message.includes('UNIQUE constraint failed: technician.MobileNumber')) {
        throw new ConflictException('Mobile number already exists.');
      }
      // Handle other constraint errors if needed
      if (error.message.includes('SQLITE_CONSTRAINT')) {
        throw new ConflictException('Database constraint violation.');
      }
    }
    
    // Re-throw ConflictException without modification
    if (error instanceof ConflictException) {
      throw error;
    }
    
    // Re-throw other errors
    throw error;
  }
}


}
