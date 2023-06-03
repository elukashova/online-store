import { HeaderInfo } from '../components/header/header.types';
import { ItemInfoType } from '../components/shopping-cart/shopping-cart.types';

export type DataToSet = PosterStorageInfo[] | HeaderInfo | ItemInfoType | string[];

export type PosterStorageInfo = {
  id: number;
  quantity: number;
};

export type JsonObj = { [key: string]: number };
