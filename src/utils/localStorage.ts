import { JsonObj } from './localStorage.types';

export const checkDataInLocalStorage = (key: string): JsonObj | null => {
  const result = localStorage.getItem(key) ? JSON.parse(localStorage.getItem(key) || '{}') : null;

  return result;
};

export const setDataToLocalStorage = (data: number[]): void => {
  localStorage.clear();
  const addedItems: JsonObj = {};

  data.forEach((value) => {
    addedItems[`item${value}`] = value;
  });

  localStorage.setItem('addedItems', JSON.stringify(addedItems));
};
