import './main.store.styles.css';
import Page from '../page-component';
import CardsField from '../../cards-field/cards-field';
import Header from '../../header/header';

export default class MainStore extends Page {
  private readonly cardsField: CardsField = new CardsField(this.header);

  constructor(id: string, public readonly header: Header) {
    super();
    this.element.id = id;
  }

  public setContent(): void {
    this.element.append(this.cardsField.element);
  }
}
