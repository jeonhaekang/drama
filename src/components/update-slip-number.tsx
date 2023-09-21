import { Button, Input } from "@nextui-org/react";
import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import { updateSlipNumber } from "~/server/order";
import { ColorMeOrder } from "~/types/colorMe";

export const UpdateSlipNumber = ({ order }: { order: ColorMeOrder }) => {
  const sale = order.sale_deliveries[0];

  const form = useForm<{ slipNumber: string }>({
    defaultValues: { slipNumber: sale.slip_number },
  });

  const isEdit =
    form.watch("slipNumber") !== sale.slip_number && form.watch("slipNumber");

  const { mutate: updateSlipNumberMutate } = useMutation({
    mutationFn: updateSlipNumber,
    onSuccess: () => {
      toast("송장을 등록하였습니다.", { type: "success" });
    },
    onError: () => {
      toast("등록에 실패하였습니다.", { type: "error" });
    },
  });

  return (
    <form
      className="flex gap-2"
      onSubmit={form.handleSubmit(({ slipNumber }) => {
        updateSlipNumberMutate({ order, slipNumber });
      })}
    >
      <Input size="sm" {...form.register("slipNumber")} />

      <Button
        type="submit"
        size="sm"
        color={isEdit ? "primary" : "default"}
        disabled={!isEdit}
      >
        등록
      </Button>
    </form>
  );
};
