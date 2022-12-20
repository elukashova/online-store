import './filter.styles.css';
import rendered from '../../utils/render/render';
import cardsData from '../../assets/json/data';
import findMinAndMaxPrice from './find.minmax.price';
import findMinAndMaxCount from './find.minmax.stock';

export default class Filter {
  constructor(private readonly container: HTMLElement, private readonly name: string) {}
  /* параметр name мне нужен только для создания заголовка фильтра,
  который потом будет выведен на экран */

  public renderCheckbox<T>(data: T[], str: string): HTMLElement {
    // параметр str мне нужен только для создания классов разных элементов
    const filterWrapper: HTMLElement = rendered('fieldset', this.container, `filters__${str} ${str}`);
    rendered('legend', filterWrapper, `${str}__legend-1`, this.name);
    data.forEach((item, ind) => {
      const inputWrapper: HTMLElement = rendered('div', filterWrapper, `${str}__input-wrapper`);
      rendered('input', inputWrapper, `${str}__input-${ind + 1}`, '', {
        id: `${str}-${ind + 1}`,
        type: 'checkbox',
        name: `${str}-${ind + 1}`,
      });
      rendered('label', inputWrapper, `${str}__label-${ind + 1}`, `${item}`, {
        for: `${str}-${ind + 1}`,
      });
    });
    return filterWrapper;
  }

  public renderInputRange(str: string): HTMLElement {
    const filterWrapper: HTMLElement = rendered('fieldset', this.container, `filters__${str}`);
    rendered('legend', filterWrapper, `filters__${str}_legend`, this.name);
    const inputWrapper: HTMLElement = rendered('div', filterWrapper, `filters__${str}_wrapper`);
    const valueWrapper: HTMLElement = rendered('div', inputWrapper, `filters__${str}_value-wrapper ${str}-value`);

    // получаем минимальные и максимальные значения из data.ts
    const minMaxPrice: number[] = findMinAndMaxPrice(cardsData.products);
    const [minPrice, maxPrice] = minMaxPrice;
    const minMaxCount: number[] = findMinAndMaxCount(cardsData.products);
    const [minCount, maxCount] = minMaxCount;

    /* единственное различие двух range это лэйблы с числом и количеством,
    поэтому я их сохранию в отдельные переменные */
    const minValue: string = str === 'price' ? `$ ${minPrice}` : `${minCount}`;
    const maxValue: string = str === 'price' ? `$ ${maxPrice}` : `${maxCount}`;

    rendered('span', valueWrapper, `${str}-value__from`, minValue);
    rendered('span', valueWrapper, `${str}-value__to`, maxValue);
    const sliderWrapper: HTMLElement = rendered('div', inputWrapper, `filters__${str}_slider`);

    // в инпут max мне нужно передать значение без знака доллара
    const maxV: string = str === 'price' ? maxValue.slice(2) : `${maxCount}`;

    rendered('input', sliderWrapper, `filters__${str}_lowest`, '', {
      id: `from-${str}`,
      type: 'range',
      value: '0',
      min: '0',
      max: maxV,
    });
    rendered('input', sliderWrapper, `filters__${str}_highest`, '', {
      id: `to-${str}`,
      type: 'range',
      value: maxV,
      min: '0',
      max: maxV,
    });
    return filterWrapper;
  }
}
