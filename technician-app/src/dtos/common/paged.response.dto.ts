export class PagedResponse<T> {
    data: T[];
    page: number;
    pageSize: number;
    totalItems: number;
    totalPages: number;
  
    constructor(data: T[], page: number, pageSize: number, totalItems: number) {
      this.data = data;
      this.page = page;
      this.pageSize = pageSize;
      this.totalItems = totalItems;
      this.totalPages = Math.ceil(totalItems / pageSize);
    }
  }
  