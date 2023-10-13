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
  Spinner,
  useDisclosure,
} from "@nextui-org/react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import clsx from "clsx";
import dayjs from "dayjs";
import Image from "next/image";
import { useRouter } from "next/router";
import { memo } from "react";
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
  } = sale;

  const { isOpen, onOpen, onOpenChange } = useDisclosure();

  const queryClient = useQueryClient();
  const router = useRouter();

  const sheetId = router.query.sheetId as string;

  const customerAddress = `${customer.pref_name}${customer.address1} ${
    customer.address2 ?? ""
  }`;

  const deliveryAddress = `${customer.pref_name}${deliveries[0].address1} ${
    deliveries[0].address2 ?? ""
  }`;

  console.log(sale);

  const isEqualAddress = isEqualString(customerAddress, deliveryAddress);

  const isValidAddress = /[\d０-９]/.test(deliveryAddress);

  const form = useForm<{ slipNumber: string }>({
    defaultValues: { slipNumber: deliveries[0].slip_number },
  });

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

  const { mutate: updateSlipNumberMutate, isLoading } = useMutation({
    mutationFn: updateSlipNumber,
    onSuccess: () => {
      toast("송장을 등록하였습니다.", { type: "success" });
    },
    onError: () => {
      toast("등록에 실패하였습니다.", { type: "error" });
    },
  });

  console.log(isLoading);

  return (
    <CardContainer>
      <CardHeader>
        <div>
          <p className="text-sm text-default-500">{id}</p>
          <p>
            {customer.name}
            <span className="text-xs text-default-400 ml-2">
              {customer.furigana}
            </span>
          </p>
          <p className="text-sm text-default-500">{deliveryAddress}</p>

          {!isValidAddress && (
            <p className="text-sm text-red-600">
              번지수가 주소에 없습니다. 주소를 확인해주세요.
            </p>
          )}

          <p className="text-sm text-default-400">
            {dayjs.unix(date).format("YYYY-MM-DD")}
          </p>
        </div>
      </CardHeader>

      {deliveries[0].memo && (
        <>
          <Divider />

          <CardHeader className="text-sm">
            <p className="text-orange-300 whitespace-pre-wrap">
              {deliveries[0].memo}
            </p>
          </CardHeader>
        </>
      )}

      <Divider />

      <CardBody className="flex flex-col gap-2">
        {details.map(
          ({
            id,
            product_name: name,
            product_num: count,
            product_thumbnail_image_url: image,
          }) => {
            const isNotSingle = count !== 1;

            return (
              <Popover key={id}>
                <PopoverTrigger>
                  <Button variant="light" className="whitespace-normal">
                    <span
                      className={clsx({
                        "text-warning-600": isNotSingle,
                        "bg-warning/20": isNotSingle,
                      })}
                    >
                      {name} {count}EA
                    </span>
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
            );
          }
        )}
      </CardBody>

      {!isEqualAddress && (
        <>
          <Divider />

          <CardFooter>
            <div className="flex gap-2 flex-wrap">
              <Chip variant="dot" color="warning" size="sm">
                {deliveries[0].name}
              </Chip>

              <p className="text-sm text-red-600">
                주문지와 배송지가 다르니 주의하세요.
              </p>
            </div>
          </CardFooter>
        </>
      )}

      <Divider />

      <CardFooter className="flex justify-between">
        <form
          className="flex gap-2"
          onSubmit={form.handleSubmit(({ slipNumber }) =>
            updateSlipNumberMutate({
              order: sale,
              slipNumber: slipNumber.trim(),
            })
          )}
        >
          <Input
            size="sm"
            placeholder="송장 번호를 입력해주세요."
            {...form.register("slipNumber")}
          />

          <Button type="submit" size="sm" color="primary" disabled={isLoading}>
            {isLoading ? <Spinner color="white" size="sm" /> : "등록"}
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
