export interface ItemDetailRequest {
  Page?: number;
  PageSize?: number;
  ItemName?: string;
  ItemId?: number;      // Optional, received from server
  IsDeleted?: boolean; 
}
