import { Button } from "@nextui-org/react";
import { toast } from "react-toastify";
import { ColorMeOrder } from "~/types/colorMe";
import { chunkArray, downloadCSV } from "~/utils";

export const DownloadCSV = ({ sales }: { sales?: ColorMeOrder[] }) => {
  const formatPostal = (postal: string): string => {
    return postal.startsWith("0") ? [postal.slice(0, 3), postal.slice(3)].join("-") : postal;
  };

  const getDeliveryDataFromOrder = ({ sale_deliveries: deliveries }: ColorMeOrder) => {
    return deliveries.map(({ postal, name, address1, address2, pref_name: pref }) => ({
      お届け先郵便番号: formatPostal(postal),
      お届け先氏名: name,
      お届け先敬称: "様",
      お届け先住所1行目: `${pref}${address1}`,
      お届け先住所2行目: address2 ?? "",
      お届け先住所3行目: "",
      お届け先住所4行目: "",
      内容品: "CD",
    }));
  };

  const handleDownloadCSV = () => {
    if (!sales) {
      return toast("잠시후 다시 시도해주세요.", { type: "warning" });
    }

    const saleDeliveries = sales.flatMap(getDeliveryDataFromOrder);

    if (saleDeliveries.length > 40) {
      const chunkSales = chunkArray(saleDeliveries, 40);

      // for (let data of chunkSales) {
      //   downloadCSV(data)
      // }

      chunkSales.forEach((chunk, index) => downloadCSV(chunk, index));
    } else {
      downloadCSV(saleDeliveries, 1);
    }
  };

  return <Button onClick={handleDownloadCSV}>CSV Download</Button>;
};
