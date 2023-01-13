import { CardDataType } from '../../card/card.types';
import { FilterType } from '../enums.filter';

// получаем минимальные и максимальные значения из data.ts
const findMinAndMax = (data: CardDataType[], field: string): number[] => {
  // eslint-disable-next-line arrow-body-style
  const valueArray: number[] = data.map((card): number => {
    return field === FilterType.Price ? card.price : card.stock;
  });
  const min: number = Math.min(...valueArray);
  const max: number = Math.max(...valueArray);
  return [min, max];
};

export default findMinAndMax;
