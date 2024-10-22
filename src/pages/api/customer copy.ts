import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const name = req.query.name as string;

  const customers = await fetch(`https://api.shop-pro.jp/v1/customers?name=${name}`, {
    headers: {
      Authorization: req.cookies.token as string,
    },
  }).then((res) => res.json());

  res.status(200).json(customers);
}
