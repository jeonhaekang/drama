import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/router";
import { DownloadCSV, OrderCard, OrderCardSkeleton } from "~/components/sheet";
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
    </div>
  );
};

export default SheetDetail;
