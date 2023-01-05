export type ItemInfoType = {
  itemOrder: number;
  itemAmount: number;
  itemTotalPrice: number;
};

export enum PromoValues {
  behappy = 10,
  smile = 15,
}

export enum PromoInputs {
  behappy = 'BEHAPPY',
  smile = 'SMILE',
}

export type Callback = (event: Event, checkout?: boolean) => void;
