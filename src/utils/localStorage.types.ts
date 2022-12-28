import { HeaderInfoType } from '../components/header/header.types';
import { ItemInfoType } from '../components/shopping-cart/shopping-cart.types';

export type JsonObj = { [key: string]: number };

export type DataToSet = number[] | HeaderInfoType | ItemInfoType;
