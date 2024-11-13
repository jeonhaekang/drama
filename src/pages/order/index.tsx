import {
  Button,
  Checkbox,
  Chip,
  DateInput,
  Input,
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
import { GetServerSideProps } from "next";
import { Key, useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";
import { debounce } from "throttle-debounce";
import { getOrderList, insertOrders } from "~/server/order";
import { ColorMeOrder } from "~/types/colorMe";
import { OneOf } from "~/types/common";
import { requiredSession } from "~/utils";

const Order = () => {
  const [selectedKeys, setSelectedKeys] = useState<Selection>(new Set());

  const [hideReservation, setHideReservation] = useState(true);

  const [keyword, setKeyword] = useState("");

  const [options, setOptions] = useState<{
    [key: string]: string | boolean;
  }>({ delivered: "false", paid: "true" });

  const handleChangeOptions = useCallback((key: string, value: string | boolean) => {
    setOptions((options) => {
      const _options = { ...options };

      if (_options[key]) delete _options[key];
      else _options[key] = value;

      return _options;
    });
  }, []);

  const {
    data: orders,
    isFetching,
    hasNextPage,
    fetchNextPage,
  } = useInfiniteQuery({
    queryKey: ["getOrderList", ...Object.values(options)],
    queryFn: ({ pageParam = 0 }) => {
      return getOrderList({
        ...options,
        limit: 100,
        offset: pageParam,
      });
    },
    getNextPageParam: (page) => {
      const { limit, total, offset } = page.meta;

      return offset + limit < total ? offset + limit : false;
    },
  });

  console.log(orders);

  const { mutate: insertOrderMutate } = useMutation({
    mutationFn: insertOrders,
    onSuccess: () => {
      toast("시트를 생성하였습니다.", { type: "success" });
    },
    onError: () => {
      toast("시트를 생성하는데 실패하였습니다.", { type: "error" });
    },
  });

  const getIsReservation = (details: ColorMeOrder["details"]) => {
    const isReservation = !!details.find(
      ({ product_name: productName, pristine_product_full_name }) =>
        productName?.includes("予約") ?? pristine_product_full_name?.includes("予約")
    );

    return isReservation;
  };

  const allOrders = useMemo(() => {
    let _orders = orders?.pages.map((page) => page.sales).flat() ?? [];

    if (hideReservation) {
      _orders = _orders.filter((order) => !getIsReservation(order.details));
    }

    _orders = _orders.filter((order) => !!order.details.find((detail) => !!detail.pristine_product_full_name?.includes(keyword)));

    const __orders = _orders.map(
      ({ id, customer, make_date: makeDate, details, paid, accepted_mail_state: acceptState, delivered }) => ({
        id,
        name: customer.name,
        date: dayjs.unix(makeDate).format("YYYY-MM-DD"),
        reservation: getIsReservation(details),
        paid,
        accept: acceptState === "sent",
        delivered,
      })
    );

    return __orders;
  }, [hideReservation, keyword, orders]);

  const selectedKeysArr = useMemo(() => {
    let _selectedKeys = Array.from(selectedKeys);

    if (selectedKeys === "all") {
      _selectedKeys = allOrders.map((order) => order.id);
    }

    return _selectedKeys;
  }, [selectedKeys, allOrders]);

  const handleCreateSheet = () => {
    if (!selectedKeysArr.length) {
      return toast("주문건을 선택해주세요.", { type: "warning" });
    }

    insertOrderMutate(selectedKeysArr as string[]);
  };

  const renderCell = useCallback((item: OneOf<typeof allOrders>, key: Key) => {
    const cellValue = item[key as keyof typeof item];

    switch (key) {
      case "paid":
        return (
          <Chip variant="flat" color={cellValue ? "success" : "danger"}>
            {cellValue ? "결제" : "미결"}
          </Chip>
        );

      case "reservation":
        return (
          <Chip variant="flat" color={cellValue ? "warning" : "primary"}>
            {cellValue ? "예약" : "일반"}
          </Chip>
        );

      case "accept":
        return (
          <Chip variant="flat" color={cellValue ? "success" : "danger"}>
            {cellValue ? "済" : "未"}
          </Chip>
        );

      case "delivered":
        return (
          <Chip variant="flat" color={cellValue ? "success" : "danger"}>
            {cellValue ? "済" : "未"}
          </Chip>
        );

      default:
        return <div className="whitespace-nowrap">{cellValue}</div>;
    }
  }, []);

  useEffect(() => {
    setSelectedKeys(new Set());
  }, [options, hideReservation]);

  return (
    <div className="flex flex-col gap-4">
      <div>
        <Input
          label="검색어"
          onChange={debounce(1000, (event) => setKeyword(event.target.value))}
          labelPlacement="outside"
          placeholder="검색어를 입력해주세요."
        />
      </div>

      <div className="flex gap-4">
        <DateInput
          label="시작일"
          labelPlacement="outside"
          onChange={debounce(1000, (data) => {
            if (data?.year && data?.month && data?.day) {
              setOptions((prev) => ({
                ...prev,
                after: dayjs(`${data.year}-${data.month}-${data.day}`).format("YYYY-MM-DD"),
              }));
            }
          })}
        />

        <DateInput
          label="종료일"
          labelPlacement="outside"
          onChange={debounce(1000, (data) => {
            if (data?.year && data?.month && data?.day) {
              setOptions((prev) => ({
                ...prev,
                before: dayjs(`${data.year}-${data.month}-${data.day}`).format("YYYY-MM-DD"),
              }));
            }
          })}
        />
      </div>

      <div className="flex gap-4 flex-wrap">
        <Checkbox onChange={() => handleChangeOptions("accepted_mail_state", "not_yet")}>미확인 주문건만 보기</Checkbox>

        <Checkbox defaultSelected={!!options?.delivered} onChange={() => handleChangeOptions("delivered", "false")}>
          미배송 주문건만 보기
        </Checkbox>

        <Checkbox defaultSelected={!!options?.paid} onChange={() => handleChangeOptions("paid", "true")}>
          결재 완료만 보기
        </Checkbox>

        <Checkbox defaultSelected={hideReservation} onChange={(event) => setHideReservation(event.target.checked)}>
          예약건 숨기기
        </Checkbox>
      </div>

      <p className="text-default-400 text-small">총 주문: {allOrders.length}</p>

      <Table
        selectionMode="multiple"
        aria-label="order table"
        selectedKeys={selectedKeys}
        onSelectionChange={setSelectedKeys}
        bottomContent={
          isFetching ? (
            <div className="flex justify-center">
              <Spinner color="white" />
            </div>
          ) : (
            hasNextPage && <Button onClick={() => fetchNextPage()}>더보기</Button>
          )
        }
      >
        <TableHeader
          columns={[
            { key: "id", label: "번호" },
            { key: "name", label: "이름" },
            { key: "date", label: "주문일" },
            { key: "reservation", label: "주문" },
            { key: "paid", label: "결제" },
            { key: "accept", label: "확인 메일" },
            { key: "delivered", label: "배송 상태" },
          ]}
        >
          {(column) => <TableColumn key={column.key}>{column.label}</TableColumn>}
        </TableHeader>

        <TableBody items={allOrders} loadingContent={<Spinner color="white" />}>
          {(order) => (
            <TableRow key={order.id}>{(column) => <TableCell>{renderCell(order, column)}</TableCell>}</TableRow>
          )}
        </TableBody>
      </Table>

      <Button onClick={handleCreateSheet} fullWidth color="primary" className="flex gap-4 sticky bottom-4">
        시트생성
      </Button>
    </div>
  );
};

export default Order;

export const getServerSideProps: GetServerSideProps = requiredSession(async (_, token) => {
  return {
    props: { token },
  };
});
