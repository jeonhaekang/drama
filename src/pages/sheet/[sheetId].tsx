import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/router";
import {
  DownloadCSV,
  OrderCard,
  OrderCardSkeleton,
  SendDeliveryMailButton,
} from "~/components/sheet";
import { SendAcceptMailButton } from "~/components/sheet/SendAcceptMailButton";
import { selectSheet } from "~/server/order";

const SheetDetail = () => {
  const router = useRouter();

  const sheetId = router.query.sheetId as string;

  const { data: orders } = useQuery({
    queryFn: () => selectSheet(sheetId),
    queryKey: ["selectSheet", sheetId],
    enabled: !!sheetId,
  });

  return (
    <div>
      <DownloadCSV sales={orders?.sales} />

      <div className="flex flex-col gap-4 my-4">
        {orders ? (
          orders.sales.map((sale) => <OrderCard key={sale.id} sale={sale} />)
        ) : (
          <OrderCardSkeleton size={5} />
        )}
      </div>

      {orders && (
        <div className="flex gap-4 sticky bottom-4 z-10">
          <SendAcceptMailButton sales={orders.sales} />
          <SendDeliveryMailButton sales={orders.sales} />
        </div>
      )}
    </div>
  );
};

export default SheetDetail;
