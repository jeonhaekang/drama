import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/router";
import { DownloadCSV, OrderCard, OrderCardSkeleton } from "~/components/sheet";
import { selectSheet } from "~/server/order";

const SheetDetail = () => {
  const router = useRouter();
  const queryClient = useQueryClient();

  // const { isOpen, onOpen, onOpenChange } = useDisclosure();

  const sheetId = router.query.sheetId as string;

  const { data: orders } = useQuery({
    queryFn: () => selectSheet(sheetId),
    queryKey: ["selectSheet", sheetId],
    enabled: !!sheetId,
  });

  // const { mutate: sendDeliveryMailMutate, isLoading } = useMutation({
  //   mutationFn: sendMail,
  //   onMutate: () => onOpenChange(),
  //   onSuccess: async () => {
  //     toast("발송 메일을 전송하였습니다.", { type: "success" });
  //   },
  //   onError: () => {
  //     toast("발송 메일 전송에 실패하였습니다.", { type: "error" });
  //   },
  //   onSettled: () => {
  //     queryClient.invalidateQueries(["selectSheet", sheetId]);
  //   },
  // });

  // const handleSendMail = useCallback(() => {
  //   const itemIds =
  //     orders?.sales
  //       .filter(
  //         ({ delivered_mail_state: deliveredState }) =>
  //           deliveredState === "not_yet"
  //       )
  //       .map(({ id }) => id) ?? [];

  //   if (itemIds.length === 0) {
  //     return toast("이미 발송 메일을 모두 전송하였습니다.", {
  //       type: "warning",
  //     });
  //   }

  //   sendDeliveryMailMutate({ itemIds, type: "accepted" });
  // }, []);

  return (
    <div>
      <DownloadCSV sales={orders?.sales} />

      <div className="flex flex-col gap-4 my-4">
        {orders ? (
          orders.sales.map((sale) => <OrderCard key={sale.id} sale={sale} />)
        ) : (
          <OrderCardSkeleton size={5} />
        )}
      </div>

      {/* {orders && (
        <div className="flex gap-4 sticky bottom-4 z-10">
          <Button
            color="primary"
            fullWidth
            disabled={isLoading}
            onPress={onOpen}
          >
            {isLoading ? <Spinner color="white" /> : "발송 메일 보내기"}
          </Button>

          <Modal isOpen={isOpen} onOpenChange={onOpenChange}>
            <ModalContent>
              <ModalHeader>발송 메일을 전송하시겠습니까?</ModalHeader>

              <ModalFooter>
                <Button size="sm" color="primary" onPress={handleSendMail}>
                  전송
                </Button>
              </ModalFooter>
            </ModalContent>
          </Modal>
        </div>
      )} */}
    </div>
  );
};

export default SheetDetail;
