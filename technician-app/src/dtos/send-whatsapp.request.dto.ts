import { ApiProperty } from "@nestjs/swagger";
import { IsOptional } from "class-validator";

export class SendWhatsappMessageRequest {
    @ApiProperty({
        type: String,
        description: "Send to person's whatsapp number",
        example: '+918169131582',
      })
      @IsOptional()
      SendToNumber: string

      @ApiProperty({
        type: String,
        description: "Content to send it to the person",
        example: 'Hello how are you',
      })
      @IsOptional()
      Message: string
    }