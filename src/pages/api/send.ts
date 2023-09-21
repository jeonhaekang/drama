import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const { itemIds, type } = JSON.parse(req.body) as {
      itemIds: string[];
      type: string;
    };

    const promises = itemIds.map(async (itemId: string) => {
      await fetch(`https://api.shop-pro.jp/v1/sales/${itemId}/mails`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: req.cookies.token as string,
        },
        body: JSON.stringify({
          mail: { type },
        }),
      });
    });

    await Promise.all(promises);

    res.status(200).json({ message: "success" });
  } catch (error) {
    res.status(500).json({ error: true });
  }
}
