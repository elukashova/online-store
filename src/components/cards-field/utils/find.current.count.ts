import { CardDataInfo, CardDataInfoPart } from '../../card/card.types';
import { CountForFilter } from '../cards-field.types';

// eslint-disable-next-line max-len
function findCountOfCurrentProducts(data: CardDataInfo[], field: keyof CardDataInfoPart): CountForFilter[] {
  const uniqueItems: CountForFilter[] = data.reduce((acc: CountForFilter[], item: CardDataInfo) => {
    const key: string = item[field].toString();
    const index = acc.findIndex((elem: CountForFilter): boolean => elem.key === key);
    if (index !== -1) {
      acc[index].count += 1;
    } else {
      acc.push({ type: field.toLowerCase(), key, count: 1 });
    }
    return acc;
  }, []);
  return uniqueItems;
}

export default findCountOfCurrentProducts;
