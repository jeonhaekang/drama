import {
  Button,
  CardBody,
  Card as CardContainer,
  CardFooter,
  CardHeader,
  Chip,
  Divider,
  Input,
  Modal,
  ModalContent,
  ModalFooter,
  ModalHeader,
  Popover,
  PopoverContent,
  PopoverTrigger,
  useDisclosure,
} from "@nextui-org/react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import dayjs from "dayjs";
import Image from "next/image";
import { useRouter } from "next/router";
import { memo, useCallback } from "react";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import { deleteOrderItem, updateSlipNumber } from "~/server/order";
import { ColorMeOrder, ColorMeOrderResponse } from "~/types/colorMe";
import { isEqualString } from "~/utils";

export const OrderCard = memo(({ sale }: { sale: ColorMeOrder }) => {
  const {
    id,
    customer,
    details,
    make_date: date,
    sale_deliveries: deliveries,
    accepted_mail_state: acceptedState,
    delivered_mail_state: deliveredState,
    paid,
  } = sale;

  const { isOpen, onOpen, onOpenChange } = useDisclosure();

  const queryClient = useQueryClient();
  const router = useRouter();

  const form = useForm<{ slipNumber: string }>({
    defaultValues: { slipNumber: deliveries[0].slip_number },
  });

  const sheetId = router.query.sheetId as string;

  const { mutate: deleteOrderItemMutate } = useMutation({
    mutationFn: deleteOrderItem,
    onSuccess: (itemId) => {
      queryClient.setQueryData<ColorMeOrderResponse>(
        ["selectSheet", sheetId],
        (data) => {
          return {
            ...data,
            sales: data?.sales.filter((sale) => sale.id !== itemId),
          } as ColorMeOrderResponse;
        }
      );

      toast("주문건을 시트에서 제거하였습니다.", { type: "success" });
    },
    onError: () => {
      toast("주문건을 시트에서 제거하는게 실패하였습니다.", { type: "error" });
    },
  });

  const { mutate: updateSlipNumberMutate } = useMutation({
    mutationFn: updateSlipNumber,
    onSuccess: () => {
      toast("송장을 등록하였습니다.", { type: "success" });
    },
    onError: () => {
      toast("등록에 실패하였습니다.", { type: "error" });
    },
  });

  const isEqualAddress = isEqualString(
    `${customer.address1} ${customer.address2 ?? ""}`,
    `${deliveries[0].address1} ${deliveries[0].address2 ?? ""}`
  );

  const isEdit =
    form.watch("slipNumber") !== deliveries[0].slip_number &&
    form.watch("slipNumber");

  const getChipColor = useCallback((state: "not_yet" | "sent" | "pass") => {
    switch (state) {
      case "not_yet":
        return "danger";

      default:
        return "success";
    }
  }, []);

  return (
    <CardContainer>
      <CardHeader>
        <div>
          <p className="text-sm text-default-500">{id}</p>

          <p>{customer.name}</p>

          <p className="text-sm text-default-400">
            {dayjs.unix(date).format("YYYY-MM-DD")}
          </p>
        </div>
      </CardHeader>

      <Divider />

      <CardBody className="flex flex-col gap-2">
        {details.map(
          ({
            id,
            product_name: name,
            product_num: count,
            product_thumbnail_image_url: image,
          }) => (
            <Popover key={id}>
              <PopoverTrigger>
                <Button variant="light" className="whitespace-normal">
                  {name} {count}EA
                </Button>
              </PopoverTrigger>

              <PopoverContent>
                <Image
                  src={image}
                  alt="image"
                  width={250}
                  height={250}
                  className="rounded-full"
                />
              </PopoverContent>
            </Popover>
          )
        )}
      </CardBody>

      <Divider />

      <CardFooter>
        <div className="flex flex-col gap-2">
          <div className="flex gap-2 flex-wrap">
            {!isEqualAddress && (
              <Chip variant="dot" color="warning" size="sm">
                {deliveries[0].name}
              </Chip>
            )}

            <Chip size="sm" variant="dot" color={getChipColor(acceptedState)}>
              확인 메일&nbsp;
              {acceptedState === "not_yet" && "미전송"}
              {acceptedState === "sent" && "전송"}
            </Chip>

            <Chip size="sm" variant="dot" color={getChipColor(deliveredState)}>
              발송 메일&nbsp;
              {deliveredState === "not_yet" && "미전송"}
              {deliveredState === "sent" && "전송"}
            </Chip>

            <Chip size="sm" variant="dot" color={paid ? "success" : "danger"}>
              {paid ? "결제완료" : "미결제"}
            </Chip>
          </div>

          {!isEqualAddress && (
            <p className="text-sm text-red-600">
              주문지와 배송지가 다르니 주의하세요.
            </p>
          )}
        </div>
      </CardFooter>

      <Divider />

      <CardFooter className="flex justify-between">
        <form
          className="flex gap-2"
          onSubmit={form.handleSubmit(({ slipNumber }) =>
            updateSlipNumberMutate({ order: sale, slipNumber })
          )}
        >
          <Input
            size="sm"
            placeholder="송장 번호를 입력해주세요."
            {...form.register("slipNumber")}
          />

          <Button
            type="submit"
            size="sm"
            color={isEdit ? "primary" : "default"}
            disabled={!isEdit}
          >
            등록
          </Button>
        </form>

        <Button color="danger" size="sm" onPress={onOpen}>
          제거
        </Button>

        <Modal isOpen={isOpen} onOpenChange={onOpenChange}>
          <ModalContent>
            <ModalHeader>시트에서 주문건을 삭제하시겠습니까?</ModalHeader>

            <ModalFooter>
              <Button
                size="sm"
                color="danger"
                onPress={() => deleteOrderItemMutate({ itemId: id, sheetId })}
              >
                삭제
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      </CardFooter>
    </CardContainer>
  );
});
