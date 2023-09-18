import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const itemId = JSON.parse(req.body).itemId;

  await fetch(`https://api.shop-pro.jp/v1/sales/${itemId}/mails`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: req.cookies.token as string,
    },
    body: JSON.stringify({
      mail: {
        type: "accepted",
      },
    }),
  });

  return res.status(200).json({ message: "success" });
}
