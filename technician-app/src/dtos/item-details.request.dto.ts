import { ApiProperty } from "@nestjs/swagger";
import { IsOptional } from "class-validator";

export class ItemDetailRequest {
    @ApiProperty({
        type: String,
        description: 'Items Identifier',
        example: '1',
      })
      @IsOptional()
      ItemId: string

      @ApiProperty({
        type: String,
        description: 'Items Name',
        example: 'Item 1',
      })
      @IsOptional()
      ItemName: string;

       @ApiProperty({
        type: Number,
        description: 'Represents the page number',
        example: 1,
      })
      @IsOptional()
      Page: number;

      @ApiProperty({
        type: Number,
        description: 'represents the page size.',
        example: 10,
      })
      @IsOptional()
      PageSize: number;

    }