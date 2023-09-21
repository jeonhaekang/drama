import {
  Button,
  Modal,
  ModalContent,
  ModalFooter,
  ModalHeader,
  Spinner,
  useDisclosure,
} from "@nextui-org/react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/router";
import { useCallback } from "react";
import { toast } from "react-toastify";
import { sendMail } from "~/server/order";
import { ColorMeOrderResponse } from "~/types/colorMe";

export const SendDeliveryMailButton = ({
  sales,
}: {
  sales: ColorMeOrderResponse["sales"];
}) => {
  const { isOpen, onOpen, onOpenChange } = useDisclosure();

  const queryClient = useQueryClient();
  const router = useRouter();

  const sheetId = router.query.sheetId as string;

  const { mutate: sendDeliveryMailMutate, isLoading } = useMutation({
    mutationFn: sendMail,
    onSuccess: async () => {
      await queryClient.invalidateQueries(["selectSheet", sheetId]);

      toast("발송 메일을 전송하였습니다.", { type: "success" });
    },
    onError: () => toast("발송 메일 전송에 실패하였습니다.", { type: "error" }),
  });

  const handleSendMail = useCallback(() => {
    const itemIds = sales
      .filter(
        ({ delivered_mail_state: deliveredState }) =>
          deliveredState === "not_yet"
      )
      .map(({ id }) => id);

    if (itemIds.length === 0) {
      return toast("이미 발송 메일을 모두 전송하였습니다.", {
        type: "warning",
      });
    }

    sendDeliveryMailMutate({ itemIds, type: "accepted" });
  }, []);

  return (
    <>
      <Button color="primary" fullWidth disabled={isLoading} onPress={onOpen}>
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
    </>
  );
};
