import { ApiProperty } from "@nestjs/swagger";
import { IsOptional } from "class-validator";

export class ServiceDetailsRequest {
    @ApiProperty({
        type: String,
        description: 'Service Details Identifier',
        example: '1',
      })
      @IsOptional()
      SvdId: string

      @ApiProperty({
        type: String,
        description: 'Items Details',
        example: 'IC-4001',
      })
      @IsOptional()
      ItemDetails: string

      @ApiProperty({
        type: String,
        description: 'Fault Message',
        example: 'Burnt Wire',
      })
      @IsOptional()
      FaultMessage: string

      @ApiProperty({
        type: String,
        description: 'Service Status',
        example: 'Resolved',
      })
      @IsOptional()
      Status: string

      @ApiProperty({
        type: Date,
        description: 'Service Due Date',
        example: '12-04-2025',
      })
      @IsOptional()
      DueDate: Date

      @ApiProperty({
        type: String,
        description: 'Technicians Identifier',
        example: '1',
      })
      @IsOptional()
      TecId:number

      @ApiProperty({
        type: Number,
        description: 'Represents the page number',
        example: '1',
      })
      @IsOptional()
      Page: number;

      @ApiProperty({
        type: Number,
        description: 'represents the page size.',
        example: '1',
      })
      @IsOptional()
      PageSize: number;
    }