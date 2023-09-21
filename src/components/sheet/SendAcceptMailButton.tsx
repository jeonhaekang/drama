import { Button, Spinner } from "@nextui-org/react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/router";
import { useCallback } from "react";
import { toast } from "react-toastify";
import { sendMail } from "~/server/order";
import { ColorMeOrderResponse } from "~/types/colorMe";

export const SendAcceptMailButton = ({
  sales,
}: {
  sales: ColorMeOrderResponse["sales"];
}) => {
  const queryClient = useQueryClient();
  const router = useRouter();

  const sheetId = router.query.sheetId as string;

  const { mutate: sendAcceptMailMutate, isLoading } = useMutation({
    mutationFn: sendMail,
    onSuccess: async () => {
      await queryClient.invalidateQueries(["selectSheet", sheetId]);

      toast("확인 메일을 전송하였습니다.", { type: "success" });
    },
    onError: () => {
      toast("확인 메일 전송에 실패하였습니다.", { type: "error" });
    },
  });

  const handleSendMail = useCallback(() => {
    const itemIds = sales
      .filter(
        ({ accepted_mail_state: acceptedState }) => acceptedState === "not_yet"
      )
      .map(({ id }) => id);

    if (itemIds.length === 0) {
      return toast("이미 확인 메일을 모두 전송하였습니다.", {
        type: "warning",
      });
    }

    sendAcceptMailMutate({ itemIds, type: "accepted" });
  }, []);

  return (
    <Button
      color="primary"
      fullWidth
      disabled={isLoading}
      onClick={handleSendMail}
    >
      {isLoading ? <Spinner color="white" /> : "확인 메일 보내기"}
    </Button>
  );
};
