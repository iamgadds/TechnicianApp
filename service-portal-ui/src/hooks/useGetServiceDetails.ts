import { SERVICE_DETAILS } from "@/constants/api-constants";
import { ServiceDetails, ServiceDetailsRequest } from "@/interfaces";
import { PagedResponse } from "@/interfaces/common";
import { useEffect, useState } from "react";

const useGetServiceDetails = (
    requestBody: ServiceDetailsRequest | null,
    forceReload: boolean,
) => {
    const [data, setData] = useState<PagedResponse<ServiceDetails>>();
    const [loading, setLoading] = useState<boolean>(false);

    const url: string = `${process.env.NEXT_PUBLIC_SERVICE_BASE_URL}${SERVICE_DETAILS.GET_SERVICE_DETAILS}`

    useEffect(() => {
        const fetchServices = async () => {
            setLoading(true);
            try {
                const requestData = requestBody ? requestBody : {}
                console.log('requestData: ', requestData)
                const res = await fetch(url, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(requestData),
                  });
                  console.log('res', res);
                  const responseData = await res.json();
                  console.log('response Data: ', responseData)
                setData(responseData);
            } catch (error) {
                console.error("Error get Alerts", error);
            } finally {
                setLoading(false);
            }
        };
        
        fetchServices();
    }, [requestBody, forceReload]);

    return { data, loading };
};

export default useGetServiceDetails;