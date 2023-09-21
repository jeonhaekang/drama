import { Button, Spinner } from "@nextui-org/react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/router";
import { toast } from "react-toastify";
import { DownloadCSV, OrderCard, OrderCardSkeleton } from "~/components/sheet";
import { selectSheet, sendMail } from "~/server/order";
import { isEmpty } from "~/utils";

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

  return (
    <div>
      <DownloadCSV sales={orders.sales} />

      <div className="flex flex-col gap-4 my-4">
        {isEmpty(orders.sales) && <OrderCardSkeleton size={5} />}

        {orders.sales.map((sale) => (
          <OrderCard key={sale.id} sale={sale} />
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
