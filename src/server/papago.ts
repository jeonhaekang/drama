export const translate = async ({
  source,
  target,
  text,
}: {
  source: string;
  target: string;
  text: string;
}) => {
  const response = await fetch("/api/papago", {
    method: "POST",
    body: JSON.stringify({ source, target, text }),
  }).then((res) => res.json());

  if (response.error) throw Error("error");

  return response.papago.message.result;
};
