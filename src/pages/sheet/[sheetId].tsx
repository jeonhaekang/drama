import { Card, CardBody, CardHeader, Divider } from "@nextui-org/react";
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

  const matome = orders?.sales.reduce((acc, sale) => {
    sale.details.forEach(({ product_name }) => {
      const _type = ["C", "D", "A", "B"];

      let type = product_name[0] as "C" | "D" | "A" | "B" | "E";

      if (!_type.includes(type)) {
        type = "E";
      }

      if (!acc[type]) {
        acc[type] = {};
      }

      acc[type][product_name.trim()] = (acc[type][product_name.trim()] || 0) + 1;
    });

    return acc;
  }, {} as { C: { [key: string]: number }; D: { [key: string]: number }; A: { [key: string]: number }; B: { [key: string]: number }; E: { [key: string]: number } });

  const map = {
    A: "자동번역",
    B: "한국 블루레이",
    C: "중국",
    D: "한국 디브이디",
    E: "기타",
  } as const;

  return (
    <div>
      <DownloadCSV sales={orders?.sales} />

      <div className="flex flex-col gap-4 my-4">
        <p className="text-default-400 text-small">총 주문: {orders?.sales.length ?? 0}</p>

        {matome && (
          <Card>
            <CardHeader>마토메</CardHeader>

            {Object.entries(matome).map(([type, drama]) => (
              <div key={type}>
                <Divider />

                <CardBody>
                  <p className="text-sm text-center mb-3 text-warning-500">{map[type as keyof typeof map]}</p>

                  <div className="flex flex-col gap-3">
                    {Object.entries(drama)
                      .sort((a, b) => a[0].split(".")[0].localeCompare(b[0].split(".")[0]))
                      .map(([name, count]) => (
                        <p key={name} className="text-sm text-center">
                          {name} {count}EA
                        </p>
                      ))}
                  </div>
                </CardBody>
              </div>
            ))}
          </Card>
        )}

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
