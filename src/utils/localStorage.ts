import { HeaderInfoType } from '../components/header/header.types';
import { JsonObj } from './localStorage.types';

export const checkDataInLocalStorage = (key: string): JsonObj | null => {
  const response: string | null = localStorage.getItem(key);
  let result: JsonObj | null = null;
  if (response) {
    try {
      result = JSON.parse(response);
    } catch (e) {
      console.log(e);
    }
  }
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
