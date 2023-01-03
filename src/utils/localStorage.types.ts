import { HeaderType } from '../components/header/header.types';
import { IsCheckoutType } from '../components/product-page/product-page.types';
import { ItemInfoType } from '../components/shopping-cart/shopping-cart.types';

export type DataToSet = PosterStorageType[] | HeaderType | ItemInfoType | string[] | IsCheckoutType;

export type PosterStorageType = {
  id: number;
  quantity: number;
};

export type JsonObj = { [key: string]: number };
