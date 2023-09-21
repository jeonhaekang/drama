import {
  Button,
  Card,
  CardBody,
  CardFooter,
  CardHeader,
  Chip,
  Divider,
  Popover,
  PopoverContent,
  PopoverTrigger,
  Skeleton,
} from "@nextui-org/react";
import { useMutation, useQuery } from "@tanstack/react-query";
import dayjs from "dayjs";
import Image from "next/image";
import { useRouter } from "next/router";
import { toast } from "react-toastify";
import { UpdateSlipNumber } from "~/components";
import { selectSheet, sendMail } from "~/server/order";
import { ColorMeOrder } from "~/types/colorMe";
import { isEmpty, isEqualString } from "~/utils";
import { downloadCSV } from "~/utils/downloadCSV";

const SheetDetail = () => {
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

  const { mutate: sendAcceptMailMutate } = useMutation({
    mutationFn: sendMail,
    onSuccess: () => toast("확인 메일을 전송하였습니다.", { type: "success" }),
    onError: () => toast("확인 메일 전송에 실패하였습니다.", { type: "error" }),
  });

  const { mutate: sendDeliveryMailMutate } = useMutation({
    mutationFn: sendMail,
    onSuccess: () => toast("발송 메일을 전송하였습니다.", { type: "success" }),
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
        {isEmpty(orders.sales) &&
          Array(5)
            .fill(0)
            .map(() => (
              <Card className="space-y-5 p-4" radius="lg">
                <div className="space-y-2">
                  <Skeleton className="w-1/5 rounded-lg">
                    <div className="h-3 rounded-lg bg-default-300"></div>
                  </Skeleton>

                  <Skeleton className="w-1/6 rounded-lg">
                    <div className="h-3 rounded-lg bg-default-300"></div>
                  </Skeleton>

                  <Skeleton className="w-1/5 rounded-lg">
                    <div className="h-3 rounded-lg bg-default-300"></div>
                  </Skeleton>
                </div>

                <Skeleton className="rounded-lg">
                  <div className="h-24 rounded-lg bg-default-300"></div>
                </Skeleton>

                <Skeleton className="w-1/6 rounded-lg">
                  <div className="h-6 rounded-lg bg-default-300"></div>
                </Skeleton>

                <Skeleton className="w-1/3 rounded-lg">
                  <div className="h-9 rounded-lg bg-default-300"></div>
                </Skeleton>
              </Card>
            ))}

        {orders.sales.map((sale) => {
          const {
            id,
            customer,
            details,
            make_date: date,
            sale_deliveries: deliveries,
            paid,
          } = sale;

          const isEqual = isEqualString(
            `${customer.address1} ${customer.address2 ?? ""}`,
            `${deliveries[0].address1} ${deliveries[0].address2 ?? ""}`
          );

          return (
            <Card key={sale.id}>
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
                  <div className="flex gap-2">
                    {!isEqual && (
                      <Chip variant="dot" color="warning" size="sm">
                        {deliveries[0].name}
                      </Chip>
                    )}

                    {paid ? (
                      <Chip size="sm" variant="dot" color="success">
                        결제완료
                      </Chip>
                    ) : (
                      <Chip size="sm" variant="dot" color="danger">
                        미결제
                      </Chip>
                    )}
                  </div>

                  {!isEqual && (
                    <p className="text-sm text-red-600">
                      주문지와 배송지가 다르니 주의하세요.
                    </p>
                  )}
                </div>
              </CardFooter>

              <Divider />

              <CardFooter>
                <UpdateSlipNumber order={sale} />
              </CardFooter>
            </Card>
          );
        })}
      </div>

      <div className="flex gap-4 sticky bottom-4 z-10">
        <Button
          fullWidth
          color="primary"
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
              // sendAcceptMailMutate({ itemIds, type: "accepted" });
            }
          }}
        >
          확인 메일 보내기
        </Button>

        <Button
          fullWidth
          color="primary"
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
              // sendDeliveryMailMutate({ itemIds, type: "delivered" });
            }
          }}
        >
          발송 메일 보내기
        </Button>
      </div>
    </div>
  );
};

export default SheetDetail;
