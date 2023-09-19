import {
  Button,
  Checkbox,
  CheckboxGroup,
  Chip,
  Selection,
  Spinner,
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
} from "@nextui-org/react";
import { useInfiniteQuery, useMutation } from "@tanstack/react-query";
import dayjs from "dayjs";
import { useMemo, useState } from "react";
import { toast } from "react-toastify";
import { getOrderList, insertOrders } from "~/server/order";
import { ColorMeOrder } from "~/types/colorMe";

const Order = () => {
  const [orderOptions, setOrderOptions] = useState<string[]>([]);
  const [selectedKeys, setSelectedKeys] = useState<Selection>(new Set());

  const [hideReservation, setHideReservation] = useState(false);
  const [paid, setPaid] = useState(false);

  const {
    data: orders,
    isFetching,
    hasNextPage,
    fetchNextPage,
  } = useInfiniteQuery({
    queryKey: ["getOrderList", ...orderOptions],
    queryFn: ({ pageParam = 0 }) => {
      const options = orderOptions.reduce(
        (options, option) => ({
          ...options,
          [option]: "not_yet",
        }),
        {}
      );

      return getOrderList({
        ...options,
        limit: 60,
        offset: pageParam,
      });
    },
    getNextPageParam: (page) => {
      const { limit, total, offset } = page.meta;

      return offset + limit < total ? offset + limit : false;
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

  const handleCreateSheet = () => {
    const _selectedKeys = [...selectedKeys];

    if (!_selectedKeys.length) {
      return toast("주문건을 선택해주세요.", { type: "warning" });
    }

    insertOrderMutate(_selectedKeys as string[]);
  };

  const allOrders = useMemo(() => {
    let _orders = orders?.pages.map((page) => page.sales).flat() ?? [];

    if (hideReservation) {
      _orders = _orders.filter((order) => !getIsReservation(order));
    }

    if (paid) {
      _orders = _orders.filter((order) => order.paid);
    }

    return _orders;
  }, [hideReservation, orders, paid]);

  const total = orders?.pages[0].meta.total;

  return (
    <div className="flex flex-col gap-4">
      <CheckboxGroup
        orientation="horizontal"
        onChange={(data) => setOrderOptions(data as string[])}
      >
        <Checkbox value="accepted_mail_state">미수락 주문건만 보기</Checkbox>
        <Checkbox value="delivered_mail_state">미발송 주문건만 보기</Checkbox>
      </CheckboxGroup>

      <div className="flex gap-2">
        <Checkbox
          onChange={(event) => {
            setHideReservation(event.target.checked);
          }}
        >
          예약건 제외
        </Checkbox>

        <Checkbox
          onChange={(event) => {
            setPaid(event.target.checked);
          }}
        >
          미결제 제외
        </Checkbox>
      </div>

      <p>총 주문 : {total}</p>

      <Table
        color="primary"
        selectionMode="multiple"
        aria-label="order table"
        onSelectionChange={(selected) => {
          const all = new Set(allOrders.map((order) => String(order.id)));

          setSelectedKeys(selected === "all" ? all : selected);
        }}
        bottomContent={
          isFetching ? (
            <div className="flex justify-center">
              <Spinner color="white" />
            </div>
          ) : (
            hasNextPage && (
              <Button onClick={() => fetchNextPage()}>더보기</Button>
            )
          )
        }
      >
        <TableHeader key={1}>
          <TableColumn>번호</TableColumn>
          <TableColumn>이름</TableColumn>
          <TableColumn>날짜</TableColumn>
          <TableColumn>예약</TableColumn>
          <TableColumn>결제</TableColumn>
        </TableHeader>

        <TableBody items={allOrders} loadingContent={<Spinner color="white" />}>
          {(order) => (
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
          )}
        </TableBody>
      </Table>

      <Button onClick={handleCreateSheet} fullWidth color="primary">
        시트생성
      </Button>
    </div>
  );
};

export default Order;
