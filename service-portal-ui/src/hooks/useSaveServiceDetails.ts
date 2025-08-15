import { SERVICE_DETAILS } from "@/constants/api-constants";
import { ServiceDetails, Technicians } from "@/interfaces";
import { useState } from "react";

const useSaveServiceDetails = () => {
    const [loading, setLoading] = useState<boolean>(false);

    const url: string = `${process.env.NEXT_PUBLIC_SERVICE_BASE_URL}${SERVICE_DETAILS.SAVE_SERVICE_DETAILS}`
    const saveServiceDetails = async (
        requestBody: ServiceDetails
    ): Promise<ServiceDetails | null> => {
        try {
            const requestData = {
                "data": requestBody,
                "mode": requestBody.SvdId ? "update" : "add"
            }
            const res = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(requestData),
              });
              const responseData : ServiceDetails = await res.json();
            return responseData
        } catch (err) {
            console.error("Error on save service details", err);
            return null;
        } finally {
            setLoading(false);
        }
        return null;
    };

    return { saveServiceDetails, loading };
};

export default useSaveServiceDetails;