import { DataType } from '../../card/card.types';

// получаем минимальные и максимальные значения из data.ts

const findMinAndMaxPrice = (data: DataType[]): number[] => {
  const valueArray = data.map((card) => card.price);
  const min: number = Math.min(...valueArray);
  const max: number = Math.max(...valueArray);
  return [min, max];
};

export default findMinAndMaxPrice;
