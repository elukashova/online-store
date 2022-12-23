import './main.store.styles.css';
import Page from '../page-component';
import CardsField from '../../cards-field/cards-field';

export default class MainStore extends Page {
  private readonly cardsField: CardsField = new CardsField();

  constructor(id: string) {
    super();
    this.element.id = id;
  }

  public setContent(): void {
    this.element.append(this.cardsField.element);
    this.cardsField.render();
  }
}
