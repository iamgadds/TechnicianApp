import { ApiProperty } from "@nestjs/swagger";
import { IsOptional } from "class-validator";

export class TechnicianDetailRequest {
    @ApiProperty({
        type: String,
        description: 'Technicians Identifier',
        example: '1',
      })
      @IsOptional()
      TecId: string

      @ApiProperty({
        type: String,
        description: 'Technicians Name',
        example: 'Murtaza',
      })
      @IsOptional()
      TechnicianName: string

      @ApiProperty({
        type: String,
        description: 'Technicians Number',
        example: 'Murtaza',
      })
      @IsOptional()
      PhoneNumber: string

      @ApiProperty({
        type: Number,
        description: 'Will join with Service and get service details if passed true',
        example: true,
      })
      @IsOptional()
      GetServiceCount: boolean;

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