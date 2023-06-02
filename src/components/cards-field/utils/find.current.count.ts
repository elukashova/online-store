import Card from '../../card/card';
import { CardDataInfo } from '../../card/card.types';
import { CountForFilter } from '../cards-field.types';

// eslint-disable-next-line max-len
function findCountOfCurrentProducts(data: Card[], field: keyof CardDataInfo): CountForFilter[] {
  const uniqueItems: CountForFilter[] = data.reduce((acc: CountForFilter[], card: Card) => {
    if (card.products) {
      const key: string = card.products[field].toString();
      const index = acc.findIndex((elem: CountForFilter): boolean => elem.key === key);
      if (index !== -1) {
        acc[index].count += 1;
      } else {
        acc.push({ type: field.toLowerCase(), key, count: 1 });
      }
    }
    return acc;
  }, []);
  return uniqueItems;
}

export default findCountOfCurrentProducts;
