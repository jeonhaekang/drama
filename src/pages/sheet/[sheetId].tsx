import { Button, Card, CardBody, CardHeader, Divider } from "@nextui-org/react";
import { useQuery } from "@tanstack/react-query";
import clsx from "clsx";
import { GetServerSideProps } from "next";
import { useRouter } from "next/router";
import { useState } from "react";
import { DownloadCSV, OrderCard, OrderCardSkeleton } from "~/components/sheet";
import { selectSheet } from "~/server/order";
import { requiredSession } from "~/utils";

const map = {
  A: "자동번역",
  B: "한국 블루레이",
  C: "중국",
  D: "한국 디브이디",
  E: "기타",
} as const;

const SheetDetail = () => {
  const router = useRouter();
  const sheetId = router.query.sheetId as string;

  const [matomeOpen, setMatomeOpen] = useState(false);

  const { data: orders } = useQuery({
    queryFn: () => selectSheet(sheetId),
    queryKey: ["selectSheet", sheetId],
    enabled: !!sheetId,
  });

  const matome = orders?.sales.reduce((acc, sale) => {
    sale.details.forEach(({ product_name, product_num, pristine_product_full_name, ...rest }) => {
      console.log(pristine_product_full_name, rest);

      const _type = ["C", "D", "A", "B"];

      const productName = pristine_product_full_name ?? product_name;

      let type = productName[0] as keyof typeof map;

      if (!_type.includes(type)) {
        type = "E";
      }

      if (!acc[map[type]]) {
        acc[map[type]] = {};
      }

      acc[map[type]][productName.trim()] = (acc[map[type]][productName.trim()] || 0) + product_num;
    });

    return acc;
  }, {} as { [key: string]: { [key: string]: number } });

  return (
    <div>
      <DownloadCSV sales={orders?.sales} />

      <div className="flex flex-col gap-4 my-4">
        <p className="text-default-400 text-small">총 주문: {orders?.sales.length ?? 0}</p>

        {matome && (
          <Card>
            <CardHeader>
              <div className="flex gap-4 items-center">
                마토메{" "}
                <Button size="sm" color="primary" onClick={() => setMatomeOpen((prev) => !prev)}>
                  {matomeOpen ? "닫기" : "펼치기"}
                </Button>
              </div>
            </CardHeader>

            {matomeOpen &&
              Object.entries(matome)
                .sort((a, b) => a[0].localeCompare(b[0]))
                .map(([type, drama]) => (
                  <div key={type}>
                    <Divider />

                    <CardBody>
                      <p className="text-sm text-center mb-3 text-warning-500">{type}</p>

                      <div className="flex flex-col items-center gap-3">
                        {Object.entries(drama)
                          .sort((a, b) => a[0].localeCompare(b[0]))
                          .map(([name, count]) => {
                            return (
                              <p
                                key={name}
                                className={clsx("text-sm w-fit", {
                                  "text-warning-600": count > 1,
                                  "bg-warning/20": count > 1,
                                })}
                              >
                                {name} {count}EA
                              </p>
                            );
                          })}
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
