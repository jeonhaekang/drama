import {
  Button,
  Chip,
  Selection,
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
} from "@nextui-org/react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import dayjs from "dayjs";
import { useState } from "react";
import { toast } from "react-toastify";
import { getOrderList, insertOrders, sendAcceptMail } from "~/server/order";
import { ColorMeOrder } from "~/types/colorMe";
import { downloadCSV } from "~/utils/downloadCSV";

const Order = () => {
  const [selectedKeys, setSelectedKeys] = useState<Selection>(new Set());

  const queryClient = useQueryClient();

  const { data: orders } = useQuery({
    queryFn: getOrderList,
    queryKey: ["getOrderList"],
    initialData: {
      sales: [],
      meta: {
        total: 0,
        limit: 0,
        offset: 0,
      },
    },
  });

  const getIsReservation = (order: ColorMeOrder) => {
    return !!order.details.find(({ product_name }) =>
      product_name.includes("予約")
    );
  };

  const { mutate: insertOrderMutate } = useMutation({
    mutationFn: insertOrders,
    onSuccess: () => {
      toast("시트를 생성하였습니다.", { type: "success" });
    },
    onError: () => {
      toast("시트를 생성하는데 실패하였습니다.", { type: "error" });
    },
  });

  const { mutate: sendAcceptMailMutate } = useMutation({
    mutationFn: sendAcceptMail,
    onSuccess: (itemIds) => {
      const filteredKeys = itemIds.filter((itemId) => {
        const item = orders.sales.find((sale) => String(sale.id) === itemId);

        if (item) {
          return !getIsReservation(item);
        }

        return false;
      });

      insertOrderMutate(filteredKeys as string[]);

      toast("수락 메일을 발송하였습니다.", { type: "success" });
    },
    onError: () => {
      toast("수락 메일을 발송하는데 실패하였습니다.", { type: "error" });
    },
    onSettled: () => {
      queryClient.invalidateQueries(["getOrderList"]);
    },
  });

  const handleCreateSheet = () => {
    const _selectedKeys = [...selectedKeys];

    if (!_selectedKeys.length) {
      return toast("주문건을 선택해주세요.", { type: "warning" });
    }

    if (
      confirm(
        "시트를 생성하면 확인 메일이 발송되며 목록에서 사라지게 됩니다.\n생성하시겠습니까?"
      )
    ) {
      sendAcceptMailMutate(_selectedKeys as string[]);
    }
  };

  const handleDownloadCSV = () => {
    const selectedOrders = orders.sales.filter((order) =>
      [...selectedKeys].includes(String(order.id))
    );

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

    const saleDeliveries = selectedOrders.reduce((acc, order) => {
      const deliveries = order.sale_deliveries
        .map(({ postal, name, address1, address2 }) => {
          return `=""${postal}"",${name},様,${address1},${address2 ?? ""},,,CD`;
        })
        .join("\n");

      return acc + "\n" + deliveries;
    }, headers.join(","));

    downloadCSV(saleDeliveries);
  };

  return (
    <div className="flex flex-col gap-4">
      <span>총 주문건 : {orders.meta.total}</span>

      <Table
        color="primary"
        selectionMode="multiple"
        aria-label="order table"
        onSelectionChange={(selected) => {
          const all = new Set(orders.sales.map((order) => String(order.id)));

          setSelectedKeys(selected === "all" ? all : selected);
        }}
      >
        <TableHeader key={1}>
          <TableColumn>번호</TableColumn>
          <TableColumn>이름</TableColumn>
          <TableColumn>날짜</TableColumn>
          <TableColumn>예약</TableColumn>
          <TableColumn>결제</TableColumn>
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
                  {dayjs.unix(order.make_date).format("YYYY-MM-DD")}
                </TableCell>

                <TableCell className="whitespace-nowrap">
                  {getIsReservation(order) && (
                    <Chip variant="dot" color="warning">
                      예약
                    </Chip>
                  )}
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
              </TableRow>
            );
          })}
        </TableBody>
      </Table>

      <div className="flex gap-4">
        {/* <Button onClick={handleDownloadCSV}>CSV 다운로드</Button> */}
        <Button onClick={handleCreateSheet} fullWidth color="primary">
          시트생성
        </Button>
      </div>
    </div>
  );
};

export default Order;
