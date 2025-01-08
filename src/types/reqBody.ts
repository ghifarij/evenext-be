import { IOrderCartItem } from "./orderCart";

export interface requestBody {
  point: number;
  coupon: boolean;
  total_price: number;
  final_price: number;
  orderCart: IOrderCartItem[];
}
