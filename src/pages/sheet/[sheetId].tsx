import { Button, Spinner } from "@nextui-org/react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/router";
import { toast } from "react-toastify";
import { OrderCard, OrderCardSkeleton } from "~/components/sheet";
import { selectSheet, sendMail } from "~/server/order";
import { ColorMeMeta, ColorMeOrder } from "~/types/colorMe";
import { isEmpty } from "~/utils";
import { downloadCSV } from "~/utils/downloadCSV";

interface Item {
  sales: ColorMeOrder[];
  meta: ColorMeMeta;
}

const SheetDetail = () => {
  const queryClient = useQueryClient();
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

  const { mutate: sendAcceptMailMutate, isLoading: isSendAcceptMailLoading } =
    useMutation({
      mutationFn: sendMail,
      onSuccess: async () => {
        await queryClient.invalidateQueries(["selectSheet", sheetId]);

        toast("확인 메일을 전송하였습니다.", { type: "success" });
      },
      onError: () =>
        toast("확인 메일 전송에 실패하였습니다.", { type: "error" }),
    });

  const {
    mutate: sendDeliveryMailMutate,
    isLoading: isSendDeliveryMailLoading,
  } = useMutation({
    mutationFn: sendMail,
    onSuccess: async () => {
      await queryClient.invalidateQueries(["selectSheet", sheetId]);

      toast("발송 메일을 전송하였습니다.", { type: "success" });
    },
    onError: () => toast("발송 메일 전송에 실패하였습니다.", { type: "error" }),
  });

  const formatPostal = (postal: string): string => {
    return postal.startsWith("0")
      ? [postal.slice(1, 4), postal.slice(4)].join("-")
      : postal;
  };

  const getDeliveryDataFromOrder = ({
    sale_deliveries: deliveries,
  }: ColorMeOrder) => {
    return deliveries.map(({ postal, name, address1, address2 }) => ({
      お届け先郵便番号: formatPostal(postal),
      お届け先氏名: name,
      お届け先敬称: "様",
      お届け先住所1行目: address1,
      お届け先住所2行目: address2 ?? "",
      お届け先住所3行目: "",
      お届け先住所4行目: "",
      内容品: "CD",
    }));
  };

  const handleDownloadCSV = () => {
    const saleDeliveries = orders.sales.flatMap(getDeliveryDataFromOrder);

    downloadCSV(saleDeliveries);
  };

  return (
    <div>
      <Button onClick={handleDownloadCSV}>CSV Download</Button>

      <div className="flex flex-col gap-4 my-4">
        {isEmpty(orders.sales) && <OrderCardSkeleton size={5} />}

        {orders.sales.map((sale) => (
          <OrderCard {...sale} />
        ))}
      </div>

      <div className="flex gap-4 sticky bottom-4 z-10">
        <Button
          fullWidth
          color="primary"
          disabled={isSendAcceptMailLoading}
          onClick={() => {
            const itemIds = orders.sales
              .filter(
                ({ accepted_mail_state: acceptedState }) =>
                  acceptedState === "not_yet"
              )
              .map(({ id }) => id);

            if (itemIds.length === 0) {
              toast("이미 확인 메일을 모두 전송하였습니다.", {
                type: "warning",
              });
            } else {
              sendAcceptMailMutate({ itemIds, type: "accepted" });
            }
          }}
        >
          {isSendAcceptMailLoading && <Spinner color="white" />}
          확인 메일 보내기
        </Button>

        <Button
          fullWidth
          color="primary"
          disabled={isSendDeliveryMailLoading}
          onClick={() => {
            const itemIds = orders.sales
              .filter(
                ({ delivered_mail_state: deliveredState }) =>
                  deliveredState === "not_yet"
              )
              .map(({ id }) => id);

            if (itemIds.length === 0) {
              toast("이미 발송 메일을 모두 전송하였습니다.", {
                type: "warning",
              });
            } else {
              sendDeliveryMailMutate({ itemIds, type: "delivered" });
            }
          }}
        >
          {isSendDeliveryMailLoading && <Spinner color="white" />}
          발송 메일 보내기
        </Button>
      </div>
    </div>
  );
};

export default SheetDetail;
