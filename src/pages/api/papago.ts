import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const { source, target, text } = JSON.parse(req.body);

    const requestBody = new URLSearchParams();
    requestBody.append("source", source); // 출발 언어 코드 (예: 한국어)
    requestBody.append("target", target); // 도착 언어 코드 (예: 영어)
    requestBody.append("text", text); // 번역하려는 텍스트

    const papago = await fetch(
      `https://naveropenapi.apigw.ntruss.com/nmt/v1/translation`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
          "X-NCP-APIGW-API-KEY-ID": process.env
            .NEXT_PUBLIC_NAVER_CLIENT_ID as string,
          "X-NCP-APIGW-API-KEY": process.env
            .NEXT_PUBLIC_NAVER_CLIENT_SECRET as string,
        },
        body: requestBody,
      }
    ).then((res) => res.json());

    res.status(200).json({ papago });
  } catch (error) {
    console.log(error);

    res.status(500).json({ error });
  }
}
