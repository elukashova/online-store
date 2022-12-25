import { HeaderInfoType } from '../components/header/header.types';
import { JsonObj } from './localStorage.types';

export const checkDataInLocalStorage = (key: string): JsonObj | null => {
  const result = localStorage.getItem(key) ? JSON.parse(localStorage.getItem(key) || '{}') : null;

  return result;
};

export const setDataToLocalStorage = (data: number[] | HeaderInfoType): void => {
  if (Array.isArray(data)) {
    localStorage.removeItem('addedItems');
    const addedItems: JsonObj = {};

    data.forEach((value) => {
      addedItems[`item${value}`] = value;
    });

    localStorage.setItem('addedItems', JSON.stringify(addedItems));
  } else {
    localStorage.removeItem('headerInfo');
    localStorage.setItem('headerInfo', JSON.stringify(data));
  }
};
