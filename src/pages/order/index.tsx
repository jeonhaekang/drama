import {
  Button,
  Checkbox,
  Chip,
  Modal,
  ModalContent,
  ModalFooter,
  ModalHeader,
  Selection,
  Spinner,
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
  useDisclosure,
} from "@nextui-org/react";
import {
  useInfiniteQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import dayjs from "dayjs";
import { Key, useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";
import { getOrderList, insertOrders, sendMail } from "~/server/order";
import { ColorMeOrder } from "~/types/colorMe";
import { OneOf } from "~/types/common";

const Order = () => {
  const queryClient = useQueryClient();
  const { isOpen, onOpen, onOpenChange } = useDisclosure();

  const [selectedKeys, setSelectedKeys] = useState<Selection>(new Set());
  const [hideReservation, setHideReservation] = useState(false);
  const [options, setOptions] = useState<{
    [key: string]: string | boolean;
  }>({});

  const handleChangeOptions = useCallback(
    (key: string, value: string | boolean) => {
      setOptions((options) => {
        const _options = { ...options };

        if (_options[key]) delete _options[key];
        else _options[key] = value;

        return _options;
      });
    },
    []
  );

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
        limit: 60,
        offset: pageParam,
      });
    },
    getNextPageParam: (page) => {
      const { limit, total, offset } = page.meta;

      return offset + limit < total ? offset + limit : false;
    },
  });

  const { mutate: insertOrderMutate } = useMutation({
    mutationFn: insertOrders,
    onSuccess: () => {
      toast("시트를 생성하였습니다.", { type: "success" });
    },
    onError: () => {
      toast("시트를 생성하는데 실패하였습니다.", { type: "error" });
    },
  });

  const { mutate: sendAcceptMailMutate, isLoading } = useMutation({
    mutationFn: sendMail,
    onMutate: () => onOpenChange(),
    onSuccess: async () => {
      toast("확인 메일을 전송하였습니다.", { type: "success" });
    },
    onError: () => {
      toast("확인 메일 전송에 실패하였습니다.", { type: "error" });
    },
    onSettled: () => {
      queryClient.invalidateQueries([
        "getOrderList",
        ...Object.values(options),
      ]);
    },
  });

  const getIsReservation = (details: ColorMeOrder["details"]) => {
    const isReservation = !!details.find(({ product_name: productName }) =>
      productName.includes("予約")
    );

    return isReservation;
  };

  const allOrders = useMemo(() => {
    let _orders = orders?.pages.map((page) => page.sales).flat() ?? [];

    if (hideReservation) {
      _orders = _orders.filter((order) => !getIsReservation(order.details));
    }

    const __orders = _orders.map(
      ({
        id,
        customer,
        make_date: makeDate,
        details,
        paid,
        accepted_mail_state: acceptState,
        delivered_mail_state: deliveryState,
      }) => ({
        id,
        name: customer.name,
        date: dayjs.unix(makeDate).format("YYYY-MM-DD"),
        reservation: getIsReservation(details),
        paid,
        accept: acceptState === "sent",
        delivery: deliveryState === "sent",
      })
    );

    return __orders;
  }, [hideReservation, orders]);

  const totalCount = useMemo(() => orders?.pages[0].meta.total, [orders]);

  const selectedKeysArr = useMemo(() => {
    let _selectedKeys = Array.from(selectedKeys);

    if (selectedKeys === "all") {
      _selectedKeys = allOrders.map((order) => order.id);
    }

    return _selectedKeys;
  }, [selectedKeys]);

  const handleCreateSheet = () => {
    if (!selectedKeysArr.length) {
      return toast("주문건을 선택해주세요.", { type: "warning" });
    }

    insertOrderMutate(selectedKeysArr as string[]);
  };

  const handleSendMail = useCallback(() => {
    if (!selectedKeysArr.length) {
      return toast("주문건을 선택해주세요.", { type: "warning" });
    }

    sendAcceptMailMutate({
      itemIds: selectedKeysArr as number[],
      type: "accepted",
    });
  }, [selectedKeysArr]);

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
      case "delivery":
        return (
          <Chip variant="flat" color={cellValue ? "success" : "danger"}>
            {cellValue ? "발송" : "미발송"}
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
      <div className="flex gap-4 flex-wrap">
        <Checkbox
          onChange={() => handleChangeOptions("accepted_mail_state", "not_yet")}
        >
          미확인 주문건만 보기
        </Checkbox>

        <Checkbox
          value="delivered_mail_state"
          onChange={() =>
            handleChangeOptions("delivered_mail_state", "not_yet")
          }
        >
          미발송 주문건만 보기
        </Checkbox>

        <Checkbox onChange={() => handleChangeOptions("paid", true)}>
          결재 완료만 보기
        </Checkbox>

        <Checkbox
          onChange={(event) => setHideReservation(event.target.checked)}
        >
          예약건 숨기기
        </Checkbox>
      </div>

      <p className="text-default-400 text-small">총 주문: {totalCount}</p>

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
            { key: "date", label: "주문일" },
            { key: "reservation", label: "주문" },
            { key: "paid", label: "결제" },
            { key: "accept", label: "확인 메일" },
            { key: "delivery", label: "발송 메일" },
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

      <div className="flex gap-4 sticky bottom-4">
        <Button onClick={handleCreateSheet} fullWidth color="primary">
          시트생성
        </Button>

        <Button fullWidth disabled={isLoading} onClick={onOpen}>
          {isLoading ? <Spinner color="white" /> : "확인 메일 보내기"}
        </Button>

        <Modal isOpen={isOpen} onOpenChange={onOpenChange}>
          <ModalContent>
            <ModalHeader>확인 메일을 전송하시겠습니까?</ModalHeader>

            <ModalFooter>
              <Button size="sm" color="primary" onPress={handleSendMail}>
                전송
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      </div>
    </div>
  );
};

export default Order;
