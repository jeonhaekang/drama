import { NextApiRequest, NextApiResponse } from "next";
import { ColorMeMeta, ColorMeOrder } from "~/types/colorMe";
import { toQueryString } from "~/utils";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const query = {
    accepted_mail_state: "not_yet",
    limit: 100,
    canceled: false,
  };

  const orders = await fetch(
    `https://api.shop-pro.jp/v1/sales?${toQueryString(query)}`,
    {
      headers: {
        Authorization: req.cookies.Authorization as string,
      },
    }
  ).then(
    (res) => res.json() as Promise<{ sales: ColorMeOrder[]; meta: ColorMeMeta }>
  );

  res.status(200).json({ orders });
}
