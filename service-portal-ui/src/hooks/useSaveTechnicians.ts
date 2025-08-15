import { TECHNICIANS } from "@/constants/api-constants";
import { Technicians } from "@/interfaces";
import { useState } from "react";

const useSaveTechnicianDetails = () => {
	const [loading, setLoading] = useState<boolean>(false);

	const url: string = `${process.env.NEXT_PUBLIC_SERVICE_BASE_URL}${TECHNICIANS.SAVE_TECHNICIAN_DETAILS}`
	const saveTechnicianDetails = async (
		requestBody: Technicians
	): Promise<Technicians | null> => {
		try {
            const requestData = {
                "data": requestBody,
                "mode": requestBody.TecId ? "update" : "add"
            }
			const res = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(requestData),
              });
              const responseData : Technicians = await res.json();
			return responseData
		} catch (err) {
			console.error("Error on save technicians", err);
			return null;
		} finally {
			setLoading(false);
		}
		return null;
	};

	return { saveTechnicianDetails, loading };
};

export default useSaveTechnicianDetails;