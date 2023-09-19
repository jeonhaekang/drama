import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const orderId = req.query.orderId;

  try {
    const response = await fetch(
      `https://api.shop-pro.jp/v1/sales/${orderId}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: req.cookies.token as string,
        },
        body: req.body,
      }
    ).then((res) => res.json());

    res.status(200).json({ order: response });
  } catch (error) {
    res.status(500).json({ error: true });
  }
}
