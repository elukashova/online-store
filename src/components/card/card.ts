import './card.styles.css';
import rendered from '../../utils/render/render';
import { CardData } from './card.types';
import BaseComponent from '../base-component/base-component';

export default class Card extends BaseComponent {
  public title: string;

  public category: string;

  public rating: number;

  public stock: number;

  public price: number;

  public discountPercentage: number;

  public images: string[];

  constructor(data: CardData) {
    super('div', 'cards__item card');
    this.title = data.title;
    this.category = data.category;
    this.rating = data.rating;
    this.stock = data.stock;
    this.price = data.price;
    this.discountPercentage = data.discountPercentage;
    this.images = data.images.slice();
    this.render();
  }

  public render(): void {
    this.element.classList.add(`${this.category}`);
    rendered('img', this.element, 'card__img', '', {
      src: this.images[0],
    });
    const cardInfo: HTMLElement = rendered('div', this.element, 'card__info');
    const cardInfoWrapper: HTMLElement = rendered('div', cardInfo, 'card__info_wrapper');
    rendered('p', cardInfoWrapper, 'card__name', `${this.title}`);
    rendered('p', cardInfoWrapper, 'card__category', `${this.category}`);
    rendered('p', cardInfoWrapper, 'card__rating', `Rating: ${this.rating}`);
    rendered('p', cardInfoWrapper, 'card__stock', `Stock: ${this.stock}`);
    rendered('p', cardInfoWrapper, 'card__price', `$ ${this.price}`);
    rendered('p', cardInfoWrapper, 'card__discount', `Discount: ${this.discountPercentage}%`);
    const buttonsWrapper: HTMLElement = rendered('div', cardInfo, 'card__btns');
    rendered('img', buttonsWrapper, 'card__btn_open-card', '', {
      src: '../../assets/icons/button-open-card.svg',
    });
    rendered('img', buttonsWrapper, 'card__btn_buy', '', {
      src: '../../assets/icons/button-buy.svg',
    });
  }

  // public createCartItem(data: DataType): HTMLElement {
  // eslint-disable-next-line max-len
  //   const itemsContainer: HTMLElement = rendered('div', this.container, 'cart__items_container cart-items');
  //   const cartInfoContainer: HTMLElement = rendered('div', itemsContainer, 'cart-items__info');
  // eslint-disable-next-line max-len
  //   const totalNumWrapper: HTMLElement = rendered('div', cartInfoContainer, 'cart-items__info_items info-items');
  //   rendered('span', totalNumWrapper, 'info-items__text', 'Items:');
  //   rendered('span', totalNumWrapper, 'info-items__number', '2');
  // eslint-disable-next-line max-len
  //   const totalPagesWrapper: HTMLElement = rendered('div', cartInfoContainer, 'cart-items__info_pages info-pages');
  //   rendered('img', totalPagesWrapper, 'info-pages__btn-left', '', {
  //     src: '../../assets/icons/cart-icon__left.svg',
  //   });
  //   rendered('span', totalPagesWrapper, 'info-pages__pages-total', '1');
  //   rendered('img', totalPagesWrapper, 'info-pages__btn-right', '', {
  //     src: '../../assets/icons/cart-icon__right.svg',
  //   });
  //   const firstItem: HTMLElement = rendered('div', itemsContainer, 'cart-items__item cart-item');
  //   rendered('span', firstItem, 'cart-item__order', '1');
  //   rendered('img', firstItem, 'cart-item__img', '', {
  //     src: data.images[0],
  //   });
  //   const firstItemDescr: HTMLElement = rendered('div', firstItem, 'cart-item__description');
  //   rendered('span', firstItemDescr, 'cart-item__description_title', data.title);
  //   rendered('span', firstItemDescr, 'cart-item__description_category', data.category);
  //   rendered('span', firstItemDescr, 'cart-item__description_size', `Size ${data.size}`);
  // eslint-disable-next-line max-len
  //   rendered('span', firstItemDescr, 'cart-item__description_rating', `Rating: ${data.rating.toString()}`);
  //   rendered(
  //     'p',
  //     firstItemDescr,
  //     'cart-item__description_text',
  // eslint-disable-next-line max-len
  //     'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vestibulum nisl sem, hendrerit vitae convallis sed, interdum nec risus.',
  //   );

  //   return itemsContainer;
  // }
}
