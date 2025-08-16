import { ITEMS } from "@/constants/api-constants";
import { ItemDetailRequest, Items } from "@/interfaces";
import { PagedResponse } from "@/interfaces/common";
import { useEffect, useState } from "react";

const useGetItemDetails = (
  requestBody: ItemDetailRequest | null,
  forceReload: boolean
) => {
  const [data, setData] = useState<PagedResponse<Items>>();
  const [loading, setLoading] = useState(false);

  const url = `${process.env.NEXT_PUBLIC_SERVICE_BASE_URL}${ITEMS.GET_ITEM_DETAILS}`;

  useEffect(() => {
    const fetchItems = async () => {
      setLoading(true);
      try {
        const reqData = requestBody ? requestBody : {};
        const res = await fetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(reqData),
        });
        const responseData = await res.json();
        setData(responseData); // If using paginated response, use responseData.data
      } catch (error) {
        console.error("Error fetching items", error);
      } finally {
        setLoading(false);
      }
    };

    fetchItems();
    // eslint-disable-next-line
  }, [requestBody, forceReload]);
  return { data, loading };
};

export default useGetItemDetails;
