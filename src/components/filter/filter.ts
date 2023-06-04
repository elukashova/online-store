/* eslint-disable max-len */
import './filter.styles.css';
import rendered from '../../utils/render';
import cardsData from '../../assets/json/data';
import findMinAndMax from './utils/find.minmax';
import { CardDataInfo } from '../card/card.types';
import { RangeFilters, RangeSettings, RangeTypeToSetting } from './enums.filter';
import Card from '../card/card';
import findCountOfCurrentProducts from '../cards-field/utils/find.current.count';
import { CountForFilter, FilterNames } from '../cards-field/cards-field.types';
import Routes from '../app/routes.types';

export default class Filter {
  public checkboxes: HTMLElement[] = [];

  public countFrom: HTMLElement | null = null;

  public countTo: HTMLElement | null = null;

  public lowestInput: HTMLInputElement | null = null;

  public highestInput: HTMLInputElement | null = null;

  public allCountsFrom: HTMLElement[] = [];

  public allCountsTo: HTMLElement[] = [];

  public minElement: HTMLElement | null = null;

  public maxElement: HTMLElement | null = null;

  public filterName!: keyof CardDataInfo;

  public prefix: string = '';

  private rangeTypeToSettingMap: RangeTypeToSetting = {
    [RangeFilters.Price]: RangeSettings.PriceFrom,
    [RangeFilters.Count]: RangeSettings.StockFrom,
  };

  constructor(
    private readonly container: HTMLElement,
    public updateActiveFilters: (filter: string) => void,
    filterName: keyof CardDataInfo,
    prefix?: string,
  ) {
    this.filterName = filterName;
    if (prefix) {
      this.prefix = prefix;
    }
  }

  public createCheckbox(data: string[]): HTMLElement {
    const filterWrapper: HTMLElement = rendered(
      'fieldset',
      this.container,
      `filters__${this.filterName} ${this.filterName}`,
    );
    rendered('legend', filterWrapper, `${this.filterName}__legend-1`, this.filterName);

    this.createCheckboxInLoop(data, this.createCheckboxItem.bind(this, filterWrapper));

    return filterWrapper;
  }

  private createCheckboxItem(filterWrapper: HTMLElement, filter: string, index: number): void {
    const inputWrapper: HTMLElement = rendered('div', filterWrapper, `${this.filterName}__input-wrapper`);
    const checkboxWrapper: HTMLElement = rendered('div', inputWrapper, `${this.filterName}__checkbox-wrapper`);
    const inputElement: HTMLElement = rendered(
      'input',
      checkboxWrapper,
      `${this.filterName}__input-${index + 1} ${filter} ${this.filterName}-item`,
      '',
      {
        id: `${filter}`,
        type: 'checkbox',
        name: `${this.filterName}`,
      },
    );
    inputElement.addEventListener('change', (): void => this.updateActiveFilters(filter));
    rendered('label', checkboxWrapper, `${this.filterName}__label-${index + 1}`, `${filter}`, {
      for: `${filter}`,
    });
    const countWrapper: HTMLElement = rendered('div', inputWrapper, `${this.filterName}__count-wrapper`);
    this.countFrom = rendered('span', countWrapper, `${this.filterName}__out-from-to-${index + 1}`, '0', {
      id: `${filter}`,
    });
    this.allCountsFrom.push(this.countFrom);
    rendered('span', countWrapper, `${this.filterName}__slash-${index + 1}`, Routes.Home);
    this.countTo = rendered('span', countWrapper, `${this.filterName}__out-from-to-${index + 1}-to`, '0', {
      id: `${filter}-to`,
    });
    this.allCountsTo.push(this.countTo);
    this.checkboxes.push(inputElement);
  }

  // eslint-disable-next-line max-len
  private createCheckboxInLoop(dataForLoop: string[], renderFunction: (item: string, index: number) => void): void {
    dataForLoop.forEach((item, index) => {
      renderFunction(item, index);
    });
  }

  public setCountsTo(cardsAll: Card[]): void {
    const counts = findCountOfCurrentProducts(cardsAll, this.filterName);
    counts.forEach((count: CountForFilter): void => {
      const countEl = this.allCountsTo.find((elem) => elem.id.replace(/-to$/, '') === count.key);
      if (countEl) {
        countEl.textContent = `${count.count}`;
      }
    });
  }

  // eslint-disable-next-line max-lines-per-function
  public createInputRange(data: keyof CardDataInfo): HTMLElement {
    const filterWrapper: HTMLElement = rendered('fieldset', this.container, `filters__${data}`);
    rendered('legend', filterWrapper, `filters__${data}_legend`);
    const inputWrapper: HTMLElement = rendered('div', filterWrapper, `filters__${data}_wrapper`);
    const sliderWrapper: HTMLElement = rendered('div', inputWrapper, `filters__${data}_slider`);
    const valueWrapper: HTMLElement = rendered('div', inputWrapper, `filters__${data}_value-wrapper ${data}-value`);

    this.prefix = data === FilterNames.PRICE ? '$ ' : '';
    const [minValue, maxValue] = findMinAndMax(cardsData.products, data);
    this.minElement = rendered('label', valueWrapper, `${data}-value__from`, `${this.prefix}${minValue}`, {
      id: `from-${data}-value`,
      for: `from-${data}`,
    });
    this.maxElement = rendered('label', valueWrapper, `${data}-value__to`, `${this.prefix}${maxValue}`, {
      id: `to-${data}-value`,
      for: `to-${data}`,
    });

    this.lowestInput = rendered('input', sliderWrapper, `filters__${data}_lowest`, '', {
      id: `from-${data}`,
      type: 'range',
      min: `${minValue}`,
      max: `${maxValue}`,
      value: `${minValue}`,
      step: '1',
    });
    this.highestInput = rendered('input', sliderWrapper, `filters__${data}_highest`, '', {
      id: `to-${data}`,
      type: 'range',
      min: `${minValue}`,
      max: `${maxValue}`,
      value: `${maxValue}`,
      step: '1',
    });
    if (data === FilterNames.PRICE) {
      this.addListenerToRange(this.lowestInput, this.highestInput, RangeFilters.Price);
    } else {
      this.addListenerToRange(this.lowestInput, this.highestInput, RangeFilters.Count);
    }

    return filterWrapper;
  }

  // eslint-disable-next-line max-len
  public addListenerToRange(
    lowestInput: HTMLInputElement,
    highestInput: HTMLInputElement,
    rangeType: RangeFilters,
  ): void {
    if (!(lowestInput instanceof HTMLInputElement && highestInput instanceof HTMLInputElement)) {
      return;
    }

    lowestInput.addEventListener('input', () => {
      const rangeSetting = this.rangeTypeToSettingMap[rangeType];
      this.changeInput(lowestInput, highestInput, rangeSetting, 'low');
      this.updateActiveFilters(`${rangeType}, ${lowestInput.value}, ${highestInput.value}`);
    });

    highestInput.addEventListener('input', () => {
      const rangeSetting = this.rangeTypeToSettingMap[rangeType];
      this.changeInput(lowestInput, highestInput, rangeSetting, 'high');
      this.updateActiveFilters(`${rangeType}, ${lowestInput.value}, ${highestInput.value}`);
    });
  }

  private getElementToUpdate(id: string): HTMLElement | null {
    switch (id) {
      case RangeSettings.PriceFrom:
        return this.minElement;
      case RangeSettings.PriceTo:
        return this.maxElement;
      case RangeSettings.StockFrom:
        return this.allCountsFrom[0];
      case RangeSettings.StockTo:
        return this.allCountsTo[this.allCountsTo.length - 1];
      default:
        return null;
    }
  }

  private updateElementValue(element: HTMLElement | null, value: string): void {
    const HTMLElement = element;
    if (HTMLElement) {
      HTMLElement.textContent = `${this.prefix} ${value}`;
    }
  }

  private changeInput(
    lowestInput: HTMLInputElement,
    highestInput: HTMLInputElement,
    rangeType: string,
    changedField: 'low' | 'high',
  ): void {
    const low: HTMLElement = lowestInput;
    const high: HTMLElement = highestInput;
    if (!(low instanceof HTMLInputElement && high instanceof HTMLInputElement)) {
      return;
    }
    const gap: number = 1;
    if (+high.value - +low.value < gap) {
      if (changedField === 'low') {
        high.value = `${+low.value + gap}`;
      } else {
        low.value = `${+high.value - gap}`;
      }
    }
    const elementToUpdate = this.getElementToUpdate(rangeType);
    if (elementToUpdate) {
      this.updateElementValue(elementToUpdate, `${changedField === 'low' ? low.value : high.value}`);
    }
    low.setAttribute('value', `${low.value}`);
    high.setAttribute('value', `${high.value}`);
  }
}
