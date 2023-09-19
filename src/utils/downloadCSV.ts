import dayjs from "dayjs";

export const downloadCSV = (content: string) => {
  const BOM = "\uFEFF"; // UTF-8의 BOM
  const blob = new Blob([BOM + content], { type: "text/csv;charset=utf-8" });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");

  a.href = url;
  a.download = dayjs(new Date()).format("YYYY-MM-DD HH:mm");
  a.click();

  window.URL.revokeObjectURL(url);
};
