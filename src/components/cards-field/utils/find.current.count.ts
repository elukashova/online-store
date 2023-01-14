import { CardDataType } from '../../card/card.types';
import { CountForFilter } from '../cards-field.types';

function findCountOfCurrentProducts(data: CardDataType[], field: string): CountForFilter[] {
  const uniqueArray: CountForFilter[] = [];
  data.forEach((item) => {
    let obj;
    let index;
    if (field === 'category') {
      obj = { type: field, key: item.category, count: 1 };
      index = uniqueArray.findIndex((elem) => elem.key === item.category);
    } else {
      obj = { type: field, key: item.size, count: 1 };
      index = uniqueArray.findIndex((elem) => elem.key === item.size);
    }
    if (index !== -1) {
      uniqueArray[index].count += 1;
    } else {
      uniqueArray.push(obj);
    }
  });
  return uniqueArray;
}

export default findCountOfCurrentProducts;
