import dayjs from "dayjs";
import { NextApiRequest, NextApiResponse } from "next";
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
    limit: 100,
    canceled: false,
    after: threeMonthAgo.format("YYYY-MM-DD"),
  } as const;

  const chunks = chunkArray(itemIds.split(", "), 100);

  const fetchPromises = chunks.map((ids) => {
    return fetch(`https://api.shop-pro.jp/v1/sales?${toQueryString({ ...defaultParams, ids: ids.join(", ") })}`, {
      headers: {
        Authorization: req.cookies.token as string,
      },
    }).then((res) => res.json());
  });

  const responses = await Promise.all(fetchPromises);

  const result = responses.flatMap((res) => res.sales);

  res.status(200).json({ items: { sales: result } });
}
