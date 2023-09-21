type State = "not_yet" | "sent" | "pass";

interface Customer {
  id: number;
  account_id: string;
  name: string;
  furigana: string;
  hojin: string;
  busho: string;
  sex: string;
  birthday: string;
  postal: string;
  pref_id: number;
  pref_name: string;
  address1: string;
  address2?: string;
  mail: string;
  tel: string | null;
  fax: string | null;
  tel_mobile: string;
  other: string | null;
  points: number;
  member: boolean;
  sales_count: number;
  receive_mail_magazine: boolean;
  answer_free_form1: string;
  answer_free_form2: string;
  answer_free_form3: string;
}

interface SaleDetail {
  id: number;
  sale_id: number;
  account_id: string;
  product_id: number;
  sale_delivery_id: number;
  option1_value: string;
  option2_value: string;
  option1_index: number;
  option2_index: number;
  product_model_number: string;
  product_name: string;
  pristine_product_full_name: string;
  product_cost: number;
  product_image_url: string;
  product_thumbnail_image_url: string;
  product_mobile_image_url: string;
  price: number;
  price_with_tax: number;
  product_num: number;
  unit: string;
  subtotal_price: number;
}

// 배송 정보 타입
interface SaleDelivery {
  id: number;
  account_id: string;
  sale_id: number;
  delivery_id: number;
  detail_ids: number[];
  name: string;
  furigana: string;
  postal: string;
  pref_id: number;
  pref_name: string;
  address1: string;
  address2?: string;
  tel: string | null;
  preferred_date: string;
  preferred_period: string;
  slip_number: string;
  noshi_text: string;
  noshi_charge: number;
  card_name: string;
  card_text: string;
  card_charge: number;
  wrapping_name: string;
  wrapping_charge: number;
  delivery_charge: number;
  total_charge: number;
  tracking_url: string;
  memo: string | null;
  delivered: boolean;
}

// 세그먼트 정보 타입
interface Segment {
  id: number;
  name: string;
  parent_sale_id: number;
  splitted: boolean;
  product_total_price: number;
  delivery_total_charge: number;
  total_price: number;
  noshi_total_charge: number;
  card_total_charge: number;
  wrapping_total_charge: number;
}

// 합계 정보 타입
interface Totals {
  normal_tax_amount: number;
  reduced_tax_amount: number;
  discount_amount_for_normal_tax: number;
  discount_amount_for_reduced_tax: number;
  total_price_with_normal_tax: number;
  total_price_with_reduced_tax: number;
}

export interface ColorMeOrder {
  id: number;
  account_id: string;
  make_date: number;
  update_date: number;
  memo: string | null;
  payment_id: number;
  mobile: boolean;
  paid: boolean;
  delivered: boolean;
  canceled: boolean;
  accepted_mail_state: State;
  paid_mail_state: State;
  delivered_mail_state: State;
  accepted_mail_sent_date: number;
  paid_mail_sent_date: number;
  delivered_mail_sent_date: number;
  point_state: string;
  gmo_point_state: string;
  yahoo_point_state: string;
  product_total_price: number;
  delivery_total_charge: number;
  fee: number;
  tax: number;
  noshi_total_charge: number;
  card_total_charge: number;
  wrapping_total_charge: number;
  point_discount: number;
  gmo_point_discount: number;
  other_discount: number;
  other_discount_name: string;
  total_price: number;
  granted_points: number;
  use_points: number;
  granted_gmo_points: number;
  use_gmo_points: number;
  granted_yahoo_points: number;
  use_yahoo_points: number;
  external_order_id: string;
  customer: Customer;
  details: SaleDetail[];
  sale_deliveries: SaleDelivery[];
  segment: Segment;
  totals: Totals;
}

export interface ColorMeMeta {
  total: number;
  limit: number;
  offset: number;
}

export interface ColorMeOrderResponse {
  sales: ColorMeOrder[];
  meta: ColorMeMeta;
}
