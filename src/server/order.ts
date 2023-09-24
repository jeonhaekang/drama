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
  const { data, error } = await supabase
    .from("orderSheets")
    .select("*")
    .order("createdAt", { ascending: false });

  if (error) throw error;

  return data;
};

export const sendMail = async (option: {
  itemIds: number[];
  type: "accepted" | "paid" | "delivered";
}) => {
  const response = await fetch(`/api/send`, {
    method: "POST",
    body: JSON.stringify(option),
  }).then((res) => res.json());

  if (response.error) throw Error("error");
};

export const updateSlipNumber = async ({
  order,
  slipNumber,
}: {
  order: ColorMeOrder;
  slipNumber: string;
}) => {
  const { error } = await fetch(`/api/order/update?orderId=${order.id}`, {
    method: "PUT",
    body: JSON.stringify({
      sale: {
        sale_deliveries: [
          { ...order.sale_deliveries[0], slip_number: slipNumber },
        ],
      },
    }),
  }).then((res) => res.json());

  if (error) throw Error("error");
};

export const insertOrders = async (itemIds: string[]) => {
  console.log("itemIds", itemIds);

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

export const deleteOrderItem = async ({
  itemId,
  sheetId,
}: {
  itemId: number;
  sheetId: string;
}) => {
  const { error } = await supabase
    .from("orderItems")
    .delete()
    .eq("itemId", itemId)
    .eq("sheetId", sheetId);

  if (error) throw error;

  return itemId;
};
