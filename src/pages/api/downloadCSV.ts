import iconv from "iconv-lite";
import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const data = req.body;

  if (!Array.isArray(data) || data.length === 0) {
    res.status(400).send("Invalid data");
    return;
  }

  const headers = Array.from(
    new Set(
      data.flatMap((obj) =>
        typeof obj === "object" && obj !== null ? Object.keys(obj) : []
      )
    )
  );
  if (headers.length === 0) {
    res.status(400).send("No valid headers found");
    return;
  }

  let csvContent = headers.join(",") + "\n";

  for (let item of data) {
    if (typeof item === "object" && item !== null) {
      let row = headers.map((header) => item[header] || "").join(",");
      csvContent += row + "\n";
    }
  }

  const ansiEncodedData = iconv.encode(csvContent, "Shift_JIS");

  res.setHeader("Content-Type", "text/csv");
  res.setHeader("Content-Disposition", "attachment; filename=data.csv");
  res.end(ansiEncodedData);
}
