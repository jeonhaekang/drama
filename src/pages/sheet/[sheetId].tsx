import { useQuery } from "@tanstack/react-query";
import { GetServerSideProps } from "next";
import { useRouter } from "next/router";
import { DownloadCSV, OrderCard, OrderCardSkeleton } from "~/components/sheet";
import { selectSheet } from "~/server/order";
import { requiredSession } from "~/utils";

const SheetDetail = () => {
  const router = useRouter();

  const sheetId = router.query.sheetId as string;

  const { data: orders } = useQuery({
    queryFn: () => selectSheet(sheetId),
    queryKey: ["selectSheet", sheetId],
    enabled: !!sheetId,
  });

  console.log(orders);

  return (
    <div>
      <DownloadCSV sales={orders?.sales} />

      <div className="flex flex-col gap-4 my-4">
        <p className="text-default-400 text-small">총 주문: {orders?.sales.length ?? 0}</p>

        {orders ? orders.sales.map((sale) => <OrderCard key={sale.id} sale={sale} />) : <OrderCardSkeleton size={5} />}
      </div>
    </div>
  );
};

export default SheetDetail;

export const getServerSideProps: GetServerSideProps = requiredSession(async (_, token) => {
  return {
    props: { token },
  };
});
