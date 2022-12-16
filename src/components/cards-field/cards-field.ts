import './cards-field.styles.css';
import BaseComponent from '../base-component/base-component';
import rendered from '../../utils/render/render';
import cardsData from '../../assets/json/data';
import Card from '../card/card';

export default class CardsField extends BaseComponent {
  constructor() {
    super('main', 'cards-field cards');
  }

  public render(): void {
    const cardsContainer: HTMLElement = rendered('div', this.element, 'cards__container');
    const card: Card = new Card(cardsContainer);
    cardsData.products.forEach((data) => {
      const cardItem = card.render(data);
      cardsContainer.append(cardItem);
    });
  }
}
