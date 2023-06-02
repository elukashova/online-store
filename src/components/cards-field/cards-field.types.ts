export type CountForFilter = {
  type: string;
  key: string;
  count: number;
};

export enum TypeOfView {
  ViewFour = 'four',
  ViewTwo = 'two',
}

export enum QueryParameters {
  Category = 'category',
  Size = 'size',
  Price = 'price',
  Count = 'count',
  Search = 'search',
  Sorting = 'sorting',
  View = 'view',
}

export enum SortBy {
  Asc = 'asc',
  Desc = 'desc',
}

export enum FilterNames {
  CATEGORY = 'category',
  SIZE = 'size',
  PRICE = 'price',
  STOCK = 'stock',
}

export const optionsData = [
  { value: 'price-asc', label: 'Price asc' },
  { value: 'price-desc', label: 'Price desc' },
  { value: 'rating-asc', label: 'Rating asc' },
  { value: 'rating-desc', label: 'Rating desc' },
];
