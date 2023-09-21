import {
  Button,
  Card,
  CardBody,
  CardFooter,
  CardHeader,
  Chip,
  Divider,
  Popover,
  PopoverContent,
  PopoverTrigger,
  Spinner,
} from "@nextui-org/react";
import { useQuery } from "@tanstack/react-query";
import dayjs from "dayjs";
import Image from "next/image";
import { useRouter } from "next/router";
import { UpdateSlipNumber } from "~/components";
import { selectSheet } from "~/server/order";
import { isEmpty, isEqualString } from "~/utils";
import { downloadCSV } from "~/utils/downloadCSV";

const SheetDetail = () => {
  const router = useRouter();

  const sheetId = router.query.sheetId as string;

  const { data: orders } = useQuery({
    queryFn: () => selectSheet(sheetId),
    queryKey: ["selectSheet", sheetId],
    enabled: !!sheetId,
    initialData: {
      sales: [],
      meta: {
        total: 0,
        limit: 0,
        offset: 0,
      },
    },
  });

  const handleDownloadCSV = () => {
    const saleDeliveries = orders.sales.reduce(
      (acc, order) => {
        const deliveries = order.sale_deliveries.map(
          ({ postal, name, address1, address2 }) => {
            const _postal = postal.startsWith("0")
              ? `${postal.slice(1, 4)}-${postal.slice(4)}`
              : postal;

            return {
              お届け先郵便番号: _postal,
              お届け先氏名: name,
              お届け先敬称: "様",
              お届け先住所1行目: address1,
              お届け先住所2行目: address2 ?? "",
              お届け先住所3行目: "",
              お届け先住所4行目: "",
              内容品: "CD",
            };
          }
        );

        return [...acc, ...deliveries];
      },
      [] as {
        お届け先郵便番号: string;
        お届け先氏名: string;
        お届け先敬称: string;
        お届け先住所1行目: string;
        お届け先住所2行目: string;
        お届け先住所3行目: string;
        お届け先住所4行目: string;
        内容品: string;
      }[]
    );

    downloadCSV(saleDeliveries);
  };

  return (
    <div>
      <Button onClick={handleDownloadCSV}>CSV Download</Button>

      <div className="flex flex-col gap-4 my-4">
        {isEmpty(orders.sales) && <Spinner color="white" />}
        {orders.sales.map((sale) => {
          const {
            id,
            customer,
            details,
            make_date: date,
            sale_deliveries: deliveries,
            paid,
          } = sale;

          const isEqual = isEqualString(
            `${customer.address1} ${customer.address2}`,
            `${deliveries[0].address1} ${deliveries[0].address2}`
          );

          return (
            <Card key={sale.id}>
              <CardHeader>
                <div>
                  <p className="text-sm text-default-500">{id}</p>

                  <p>{customer.name}</p>

                  <p className="text-sm text-default-400">
                    {dayjs.unix(date).format("YYYY-MM-DD")}
                  </p>
                </div>
              </CardHeader>

              <Divider />

              <CardBody className="flex flex-col gap-2">
                {details.map(
                  ({
                    id,
                    product_name: name,
                    product_num: count,
                    product_thumbnail_image_url: image,
                  }) => (
                    <Popover key={id}>
                      <PopoverTrigger>
                        <Button variant="light" className="whitespace-normal">
                          {name} {count}EA
                        </Button>
                      </PopoverTrigger>

                      <PopoverContent>
                        <Image
                          src={image}
                          alt="image"
                          width={250}
                          height={250}
                          className="rounded-full"
                        />
                      </PopoverContent>
                    </Popover>
                  )
                )}
              </CardBody>

              <Divider />

              <CardFooter>
                <div className="flex flex-col gap-2">
                  <div className="flex gap-2">
                    {!isEqual && (
                      <Chip variant="dot" color="warning" size="sm">
                        {deliveries[0].name}
                      </Chip>
                    )}

                    {paid ? (
                      <Chip size="sm" variant="dot" color="success">
                        결제완료
                      </Chip>
                    ) : (
                      <Chip size="sm" variant="dot" color="danger">
                        미결제
                      </Chip>
                    )}
                  </div>

                  {!isEqual && (
                    <p className="text-sm text-red-600">
                      주문지와 배송지가 다르니 주의하세요.
                    </p>
                  )}
                </div>
              </CardFooter>

              <Divider />

              <CardFooter>
                <UpdateSlipNumber order={sale} />
              </CardFooter>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default SheetDetail;
