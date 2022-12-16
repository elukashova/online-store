import './card.styles.css';
// import BaseComponent from '../base-component/base-component';

import rendered from '../../utils/render/render';
import { DataType } from './card.types';

export default class Card {
  constructor(private readonly container: HTMLElement) {}

  public render(data: DataType): HTMLElement {
    const container: HTMLElement = rendered('div', this.container, 'cards__item card');
    rendered('img', container, 'card__img', '', {
      src: data.images[0],
    });
    const cardInfo: HTMLElement = rendered('div', container, 'card__info');
    const cardInfoWrapper: HTMLElement = rendered('div', cardInfo, 'card__info_wrapper');
    rendered('p', cardInfoWrapper, 'card__name', `${data.title}`);
    rendered('p', cardInfoWrapper, 'card__category', `${data.category}`);
    rendered('p', cardInfoWrapper, 'card__rating', `${data.rating}`);
    rendered('p', cardInfoWrapper, 'card__stock', `${data.stock}`);
    rendered('p', cardInfoWrapper, 'card__price', `${data.price}`);
    rendered('p', cardInfoWrapper, 'card__discount', `${data.discountPercentage}`);
    const buttonsWrapper: HTMLElement = rendered('div', cardInfo, 'card__btns');
    rendered('img', buttonsWrapper, 'card__btn_open-card', '', {
      src: '../../assets/icons/button-open-card.svg',
    });
    rendered('img', buttonsWrapper, 'card__btn_buy', '', {
      src: '../../assets/icons/button-buy.svg',
    });
    return container;
  }
}
