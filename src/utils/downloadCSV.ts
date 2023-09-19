import dayjs from "dayjs";
import { TextEncoder } from "text-encoding";

export const downloadCSV = (content: string) => {
  const encoder = new TextEncoder("windows-1252");
  const encodedContent = encoder.encode(content);

  const blob = new Blob([encodedContent], { type: "text/csv" });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");

  a.href = url;
  a.download = dayjs(new Date()).format("YYYY-MM-DD HH:mm") + ".csv";
  a.click();

  window.URL.revokeObjectURL(url);
};
