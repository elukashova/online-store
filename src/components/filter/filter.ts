import './filter.styles.css';

import rendered from '../../utils/render/render';

export default class Filter {
  constructor(private readonly container: HTMLElement, private readonly name: string) {}
  /* параметр name мне нужен только для создания заголовка фильтра,
  который потом будет выведен на экран */

  public renderCheckbox(data: number[], str: string): HTMLElement {
    // параметр str мне нужен только для создания классов разных элементов
    const filterWrapper: HTMLElement = rendered('fieldset', this.container, `filters__${str} ${str}`);
    rendered('legend', filterWrapper, `${str}__legend-1`, this.name);
    data.forEach((num) => {
      const inputWrapper: HTMLElement = rendered('div', filterWrapper, `${str}__input-wrapper`);
      rendered('input', inputWrapper, `${str}__input-${num}`, '', {
        id: `${str}-${num}`,
        type: 'checkbox',
        name: `${str}-${num}`,
      });
      rendered('label', inputWrapper, `${str}__label-${num}`, `${this.name}${num}`, {
        for: `${str}-${num}`,
      });
    });
    return filterWrapper;
  }

  public renderInputRange(str: string): HTMLElement {
    const filterWrapper: HTMLElement = rendered('fieldset', this.container, `filters__${str}`);
    rendered('legend', filterWrapper, `filters__${str}_legend`, this.name);
    const inputWrapper: HTMLElement = rendered('div', filterWrapper, `filters__${str}_wrapper`);
    const valueWrapper: HTMLElement = rendered('div', inputWrapper, `filters__${str}_value-wrapper ${str}-value`);

    /* единственное различие двух range это лэйблы с числом и количеством,
    поэтому я их сохранию в отдельные переменные */
    const minValue: string = str === 'price' ? '$ 0' : '0';
    const maxValue: string = str === 'price' ? '$ 120' : '50';

    rendered('span', valueWrapper, `${str}-value__from`, minValue);
    rendered('span', valueWrapper, `${str}-value__to`, maxValue);
    const sliderWrapper: HTMLElement = rendered('div', inputWrapper, `filters__${str}_slider`);

    // в инпут max мне нужно передать значение без знака доллара
    const maxV: string = str === 'price' ? maxValue.slice(2) : '50';

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
