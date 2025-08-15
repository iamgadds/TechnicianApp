import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ServiceDetails, ServiceDetailsRequest } from 'src/dtos';
import { PagedResponse } from 'src/dtos/common';
import { Repository } from 'typeorm';

@Injectable()
export class ServiceDetailsService {
    constructor(
        @InjectRepository(ServiceDetails)
        private readonly serviceRepo: Repository<ServiceDetails>,
      ) {}
    
      async getServiceDetails(request: ServiceDetailsRequest): Promise<PagedResponse<ServiceDetails>> {

        const { Page = 1, PageSize = 10 } = request;

        const queryBuilder = this.serviceRepo.createQueryBuilder('serviceDetails')
        .leftJoinAndSelect('serviceDetails.Technician', 'technician');
      
        if (request.SvdId) {
          queryBuilder.andWhere('serviceDetails.SvdId = :id', { id: request.SvdId });
        }
      
        if (request.ItemDetails) {
          queryBuilder.andWhere('serviceDetails.ItemDetails LIKE :item', { item: `%${request.ItemDetails}%` });
        }
      
        if (request.FaultMessage) {
          queryBuilder.andWhere('serviceDetails.FaultMessage LIKE :message', { message: `%${request.FaultMessage}%` });
        }

        if (request.Status) {
          queryBuilder.andWhere('serviceDetails.Status = :status', { status: `${request.Status}` });
        }

        if (request.TecId) {
          queryBuilder.andWhere('serviceDetails.TecId = :tecId', { tecId: request.TecId });
        }

        queryBuilder.andWhere('serviceDetails.IsDeleted = :isDeleted', { isDeleted: false });
      
        const [data, total] = await queryBuilder
        .orderBy('serviceDetails.SvdId', 'DESC')
        .skip((Page - 1) * PageSize)
        .take(PageSize)
        .getManyAndCount();

        const response : PagedResponse<ServiceDetails> = {
          data,
          totalItems: total,
          page: Page,
          pageSize: PageSize,
          totalPages: Math.ceil(total / PageSize)
        };

        return response;
      }
    
      async saveServiceDetails(data: ServiceDetails, mode: 'add' | 'update' | 'delete'): Promise<any> {

        if (mode === 'add' || mode === 'update'){
          data.CreatedOn = new Date()
          return this.serviceRepo.save(data);
        }
        if (mode === 'delete') return this.serviceRepo.delete(data.SvdId);
      }
}
