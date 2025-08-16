import { Body, Controller, Post } from '@nestjs/common';
import { ItemService } from './item.service';
import { ItemDetailRequest } from 'src/dtos/item-details.request.dto';
import { Item } from 'src/dtos/item.entity';

@Controller('item')
export class ItemController {
    constructor(private readonly itemService: ItemService) {}

    @Post('get-item-details')
    async getItemDetails(@Body() request: ItemDetailRequest) {
    return this.itemService.getItemDetails(request);
    }

     @Post('saveItemDetails')
        async saveItemDetails(@Body() body: { data: Item; mode: 'add' | 'update' | 'delete' }) {
        return this.itemService.saveItemDetails(body.data, body.mode);
    }
}       
