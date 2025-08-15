import { TECHNICIANS } from "@/constants/api-constants";
import { TechnicianDetailRequest, Technicians } from "@/interfaces";
import { useEffect, useState } from "react";

const useGetTechniciansDetails = (
	requestBody: TechnicianDetailRequest | null,
	forceReload: boolean,
) => {
	const [data, setData] = useState<Technicians[]>([]);
	const [loading, setLoading] = useState<boolean>(false);

	const url: string = `${process.env.NEXT_PUBLIC_SERVICE_BASE_URL}${TECHNICIANS.GET_TECHNICIAN_DETAILS}`

	useEffect(() => {
		const fetchTechnicians = async () => {
			setLoading(true);
			try {
				console.log('url: ', url)
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
		
		fetchTechnicians();
	}, [requestBody, forceReload]);

	return { data, loading };
};

export default useGetTechniciansDetails;