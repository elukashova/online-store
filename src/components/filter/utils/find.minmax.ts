import { CardDataType } from '../../card/card.types';

// получаем минимальные и максимальные значения из data.ts

const findMinAndMax = (data: CardDataType[], field: string): number[] => {
  const valueArray = data.map((card) => (field === 'price' ? card.price : card.stock));
  const min: number = Math.min(...valueArray);
  const max: number = Math.max(...valueArray);
  return [min, max];
};

export default findMinAndMax;
