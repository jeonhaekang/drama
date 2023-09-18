import { Button, Chip } from "@nextui-org/react";
import {
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
} from "@nextui-org/table";
import { useQuery } from "@tanstack/react-query";
import dayjs from "dayjs";
import Image from "next/image";
import { useRouter } from "next/router";
import { selectSheet } from "~/server/order";
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
    const headers = [
      "お届け先郵便番号",
      "お届け先民名",
      "お届け先敬称",
      "お届け先1行目",
      "お届け先2行目",
      "お届け先3行目",
      "お届け先4行目",
      "内容品",
    ];

    const saleDeliveries = orders.sales.reduce((acc, order) => {
      const deliveries = order.sale_deliveries
        .map(({ postal, name, address1, address2 }) => {
          const _postal = postal.startsWith("0")
            ? `${postal.slice(1, 4)}-${postal.slice(4)}`
            : postal;

          return `${_postal},${name},様,${address1},${address2 ?? ""},,,CD`;
        })
        .join("\n");

      return acc + "\n" + deliveries;
    }, headers.join(","));

    downloadCSV(saleDeliveries);
  };

  return (
    <div>
      <Button onClick={handleDownloadCSV}>CSV Download</Button>

      <Table
        isStriped
        aria-label="Example static collection table"
        className="my-4"
      >
        <TableHeader>
          <TableColumn>번호</TableColumn>
          <TableColumn>이름</TableColumn>
          <TableColumn>상품</TableColumn>
          <TableColumn>결제</TableColumn>
          <TableColumn>별주소</TableColumn>
          <TableColumn>날짜</TableColumn>
        </TableHeader>

        <TableBody>
          {orders.sales.map((order) => {
            return (
              <TableRow key={order.id}>
                <TableCell>{order.id}</TableCell>

                <TableCell className="whitespace-nowrap">
                  {order.customer.name}
                </TableCell>

                <TableCell className="whitespace-nowrap">
                  <div className="flex flex-col">
                    {order.details.map((detail) => (
                      <div key={detail.id} className="flex gap-2 items-center">
                        <Image
                          src={detail.product_thumbnail_image_url}
                          alt="image"
                          width={70}
                          height={70}
                        />
                        <span>{detail.product_name}</span>
                        <span>{detail.product_num}EA</span>
                      </div>
                    ))}
                  </div>
                </TableCell>

                <TableCell>
                  {order.paid ? (
                    <Chip variant="dot" color="primary">
                      결제
                    </Chip>
                  ) : (
                    <Chip variant="dot" color="danger">
                      미결
                    </Chip>
                  )}
                </TableCell>

                <TableCell>
                  {order.customer.address1 !==
                    order.sale_deliveries[0].address1 && (
                    <Chip variant="dot" color="warning">
                      {order.sale_deliveries[0].name}
                    </Chip>
                  )}
                </TableCell>

                <TableCell className="whitespace-nowrap">
                  {dayjs.unix(order.make_date).format("YYYY-MM-DD")}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>

      <Button color="primary" fullWidth>
        운송장 등록
      </Button>
    </div>
  );
};

export default SheetDetail;