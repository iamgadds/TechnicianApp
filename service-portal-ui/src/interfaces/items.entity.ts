export interface Items {
  ItemId?: number;        // Optional for 'add', present for 'update'/'delete'
  ItemName: string;
  CreatedOn?: Date;       // Optional, received from server
  IsDeleted?: boolean;    // Optional, received from server
}