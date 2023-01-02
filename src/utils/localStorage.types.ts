import { HeaderInfoType } from '../components/header/header.types';
import { ItemInfoType } from '../components/shopping-cart/shopping-cart.types';

export type DataToSet = PosterStorageInfoType[] | HeaderInfoType | ItemInfoType | string[];

export type PosterStorageInfoType = {
  id: number;
  quantity: number;
};

export type JsonObj = { [key: string]: number };
