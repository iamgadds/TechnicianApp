import { Body, Controller, Post } from '@nestjs/common';
import { TwilioService } from './twilio.service';
import { request } from 'http';
import { SendWhatsappMessageRequest } from 'src/dtos/send-whatsapp.request.dto';

@Controller('twilio')
export class TwilioController {
    constructor(private readonly twilioService: TwilioService) {}

    @Post('send-whatsapp-message')
    async SendWhatsappNumber(@Body() request: SendWhatsappMessageRequest){
        return this.twilioService.sendWhatsApp(request.SendToNumber, request.Message);
    }

}
