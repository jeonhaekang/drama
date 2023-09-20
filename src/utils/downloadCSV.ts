import dayjs from "dayjs";

export const downloadCSV = async (
  data: { [key: string]: string | number }[]
) => {
  const response = await fetch("/api/downloadCSV", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  const blob = await response.blob();
  const url = window.URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = dayjs(new Date()).format("YYYY-MM-DD HH:mm") + ".csv";
  a.click();
  window.URL.revokeObjectURL(url);
};

export const downloadSrt = (srtContent: string, filename: string) => {
  const blob = new Blob([srtContent], { type: "text/plain;charset=utf-8" });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");

  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  window.URL.revokeObjectURL(url);
};
