import { ColorMeMeta, ColorMeOrder } from "~/types/colorMe";
import { toQueryString } from "~/utils";
import { supabase } from "./config";

export const getOrderList = async (params = {}) => {
  const response = await fetch(`/api/order?${toQueryString(params)}`).then(
    (res) =>
      res.json() as Promise<{
        orders: { sales: ColorMeOrder[]; meta: ColorMeMeta };
      }>
  );

  return response.orders;
};

export const selectSheet = async (sheetId: string) => {
  const { data, error } = await supabase
    .from("orderSheets")
    .select("*, orderItems(*)")
    .eq("id", sheetId)
    .single();

  if (error) throw error;

  const response = await fetch(
    `/api/items?itemIds=${data.orderItems
      .map((item) => item.itemId)
      .join(", ")}`
  ).then(
    (res) =>
      res.json() as Promise<{
        items: { sales: ColorMeOrder[]; meta: ColorMeMeta };
      }>
  );

  return response.items;
};

export const selectSheets = async () => {
  const { data, error } = await supabase.from("orderSheets").select("*");

  if (error) throw error;

  return data;
};

export const sendAcceptMail = async (itemIds: string[]) => {
  const promises = itemIds.map(async (itemId) => {
    await fetch(`/api/send`, {
      method: "POST",
      body: JSON.stringify({ itemId }),
    });
  });

  await Promise.all(promises);

  return itemIds;
};

export const insertOrders = async (itemIds: string[]) => {
  const { data: sheet, error } = await supabase
    .from("orderSheets")
    .insert({})
    .select()
    .single();

  if (error) throw error;

  const { error: itemError } = await supabase
    .from("orderItems")
    .insert(itemIds.map((itemId) => ({ sheetId: sheet.id, itemId })));

  if (itemError) throw itemError;

  return sheet;
};
