import dayjs from "dayjs";
import { NextApiRequest, NextApiResponse } from "next";
import { ColorMeMeta, ColorMeOrder } from "~/types/colorMe";
import { toQueryString } from "~/utils";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const threeMonthAgo = dayjs().subtract(3, "month");

  const defaultParams = {
    limit: 100,
    canceled: false,
    after: threeMonthAgo.format("YYYY-MM-DD"),
  } as const;

  const optionalParams = (req.query as { [key: string]: string }) ?? {};

  const orders = await fetch(
    `https://api.shop-pro.jp/v1/sales?${toQueryString({
      ...defaultParams,
      ...optionalParams,
    })}`,
    {
      headers: {
        Authorization: req.cookies.token as string,
      },
    }
  ).then(
    (res) => res.json() as Promise<{ sales: ColorMeOrder[]; meta: ColorMeMeta }>
  );

  res.status(200).json({ orders });
}
