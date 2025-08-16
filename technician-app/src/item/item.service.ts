import { ConflictException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Item } from 'src/dtos/item.entity';
import { Repository, Like, EntityManager } from 'typeorm';
import { ItemDetailRequest } from 'src/dtos/item-details.request.dto';
import { PagedResponse } from 'src/dtos/common'; // {data, totalItems, page, pageSize, totalPages}
import { QueryFailedError } from 'typeorm';
import { ServiceDetails } from 'src/dtos';

@Injectable()
export class ItemService {
  constructor(
    @InjectRepository(Item)
    private readonly itemRepo: Repository<Item>
  ) {}

  // Paged & filtered GET
  async getItemDetails(request: ItemDetailRequest): Promise<PagedResponse<Item>> { 
    const { Page = 1, PageSize = 10, ItemName } = request;

    const queryBuilder = this.itemRepo.createQueryBuilder('item');

    if (ItemName) {
      queryBuilder.andWhere('item.ItemName LIKE :name', { name: `%${ItemName}%` });
    }

    // Optionally add "IsDeleted" if supporting soft delete
    queryBuilder.andWhere('item.IsDeleted = :isDeleted', { isDeleted: false });

    const [data, total] = await queryBuilder
      .orderBy('item.ItemName', 'ASC')
      .skip((Page - 1) * PageSize)
      .take(PageSize)
      .getManyAndCount();

    const response: PagedResponse<Item> = {
      data,
      totalItems: total,
      page: Page,
      pageSize: PageSize,
      totalPages: Math.ceil(total / PageSize)
    };

    return response;
  }

  // Add/Update/Delete with conflict/uniqueness handling
  async saveItemDetails(data: Item, mode: 'add' | 'update' | 'delete'): Promise<any> {
    try {
      if (mode === 'add') {
        // Name uniqueness check
        const existing = await this.itemRepo.findOne({
          where: { ItemName: data.ItemName }
        });
        if (existing) throw new ConflictException('Item name already exists.');

        return this.itemRepo.save({
          ...data,
          // Add timestamps or other defaults as necessary
        });
      }

      if (mode === 'update') {
        // Check for name collision with other items
        const existing = await this.itemRepo.findOne({
          where: { ItemName: data.ItemName }
        });
        if (existing && existing.ItemId !== data.ItemId) {
          throw new ConflictException('Item name already exists.');
        }
        // Update info
        return this.itemRepo.save({ ...data });
      }

      if (mode === 'delete') {
  return this.itemRepo.manager.transaction(async (manager: EntityManager) => {
    const relatedCount = await manager.count(ServiceDetails, { where: { ItemId: data.ItemId } });
    
    if (relatedCount > 0) {
      // Dependent service records exist, throw error instead of delete
      throw new ConflictException('Cannot delete item: related service records exist.');
    }

    // Safe to delete item
    await manager.delete(Item, data.ItemId);
  });
}

    } catch (error) {
      if (error instanceof QueryFailedError) {
        if (error.message.includes('UNIQUE constraint failed: item.ItemName')) {
          throw new ConflictException('Item name already exists.');
        }
      }
      if (error instanceof ConflictException) throw error;
      throw error;
    }
  }
}
