import { ITEMS } from "@/constants/api-constants";
import { Items } from "@/interfaces";
import { useState } from "react";

const useSaveItemDetails = () => {
  const [loading, setLoading] = useState(false);

  const url = `${process.env.NEXT_PUBLIC_SERVICE_BASE_URL}${ITEMS.SAVE_ITEM_DETAILS}`;
  const saveItemDetails = async (
    requestBody: Items,
    mode?: "add" | "update" | "delete"
  ): Promise<Response | null> => {
    setLoading(true);
    try {
      const reqData = {
        data: requestBody,
        mode: mode || (requestBody.ItemId ? "update" : "add"),
      };
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(reqData),
      });
      return res;
    } catch (err) {
      console.error("Error on save item", err);
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { saveItemDetails, loading };
};

export default useSaveItemDetails;
