import {  TWILIO } from "@/constants/api-constants";
import { ServiceDetails } from "@/interfaces";
import { SendWhatsappMessageRequest } from "@/interfaces/send-whatsapp.request.dto";
import { useState } from "react";

const useSendWhatsappMessage = () => {
    const [loading, setLoading] = useState<boolean>(false);

    const url: string = `${process.env.NEXT_PUBLIC_SERVICE_BASE_URL}${TWILIO.SEND_WHATSAPP_MESSAGE}`
    const sendWhatsappMessage = async (
        requestBody: SendWhatsappMessageRequest
    ): Promise<boolean> => {
        try {
            const requestData = requestBody
            const res = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(requestData),
              });
              const responseData : any = await res.json();

              if(responseData){
                return !responseData.errorCode
              }
            return false
        } catch (err) {
            console.error("Error on save service details", err);
            return false;
        } finally {
            setLoading(false);
        }
    };

    return { sendWhatsappMessage, loading };
};

export default useSendWhatsappMessage;