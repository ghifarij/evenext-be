export interface IOrderCartItem {
  qty: number;
  ticket: {
    id: number;
    price: number;
    seats: number;
  };
}
