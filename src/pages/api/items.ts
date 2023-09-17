import { NextApiRequest, NextApiResponse } from "next";
import { ColorMeMeta, ColorMeOrder } from "~/types/colorMe";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const itemIds = req.query.itemIds;

  const items = await fetch(
    `https://api.shop-pro.jp/v1/sales?ids=${itemIds}&limit=100`,
    {
      headers: {
        Authorization: req.cookies.Authorization as string,
      },
    }
  ).then(
    (res) => res.json() as Promise<{ sales: ColorMeOrder[]; meta: ColorMeMeta }>
  );

  res.status(200).json({ items });
}
