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
import { Key, useCallback, useMemo, useState } from "react";
import { toast } from "react-toastify";
import { getOrderList, insertOrders } from "~/server/order";
import { ColorMeOrder } from "~/types/colorMe";
import { OneOf } from "~/types/common";

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

  const getIsReservation = (details: ColorMeOrder["details"]) => {
    return !!details.find(({ product_name: productName }) =>
      productName.includes("予約")
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
      _orders = _orders.filter((order) => !getIsReservation(order.details));
    }

    if (paid) {
      _orders = _orders.filter((order) => order.paid);
    }

    const __orders = _orders.map(
      ({ id, customer, make_date: makeDate, details, paid }) => ({
        id,
        name: customer.name,
        date: dayjs.unix(makeDate).format("YYYY-MM-DD"),
        reservation: getIsReservation(details),
        paid,
      })
    );

    return __orders;
  }, [hideReservation, orders, paid]);

  const renderCell = useCallback((item: OneOf<typeof allOrders>, key: Key) => {
    const cellValue = item[key as keyof typeof item];

    switch (key) {
      case "paid":
        return (
          <Chip variant="flat" color={cellValue ? "success" : "danger"}>
            {cellValue ? "결제" : "미결제"}
          </Chip>
        );

      case "reservation":
        return (
          <Chip variant="flat" color="warning">
            예약
          </Chip>
        );

      default:
        return cellValue;
    }
  }, []);

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

      <p className="text-default-400 text-small">총 주문: {total}</p>

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
        <TableHeader
          columns={[
            { key: "id", label: "번호" },
            { key: "name", label: "이름" },
            { key: "date", label: "날짜" },
            { key: "reservation", label: "예약" },
            { key: "paid", label: "결제" },
          ]}
        >
          {(column) => (
            <TableColumn key={column.key}>{column.label}</TableColumn>
          )}
        </TableHeader>

        <TableBody items={allOrders} loadingContent={<Spinner color="white" />}>
          {(order) => (
            <TableRow key={order.id}>
              {(column) => <TableCell>{renderCell(order, column)}</TableCell>}
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
