import dayjs from "dayjs";
import { NextApiRequest, NextApiResponse } from "next";
import { ColorMeMeta, ColorMeOrder } from "~/types/colorMe";
import { toQueryString } from "~/utils";

function chunkArray(array: any[], size: number) {
  const chunkedArray = [];
  for (let i = 0; i < array.length; i += size) {
    chunkedArray.push(array.slice(i, i + size));
  }
  return chunkedArray;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const itemIds = req.query.itemIds as string;

  const threeMonthAgo = dayjs().subtract(3, "month");

  const defaultParams = {
    ids: itemIds,
    limit: 100,
    canceled: false,
    after: threeMonthAgo.format("YYYY-MM-DD"),
  } as const;

  const result = [];

  const chunk = chunkArray(itemIds.split(", "), 100);

  for (let ids of chunk) {
    const items = await fetch(
      `https://api.shop-pro.jp/v1/sales?${toQueryString({ ...defaultParams, ids: ids.join(", ") })}`,
      {
        headers: {
          Authorization: req.cookies.token as string,
        },
      }
    ).then((res) => res.json() as Promise<{ sales: ColorMeOrder[]; meta: ColorMeMeta }>);

    result.push(...items.sales);
  }

  res.status(200).json({ items: { sales: result } });
}
