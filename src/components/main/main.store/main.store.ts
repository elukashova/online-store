import '../main.css';
import './main.store.styles.css';
import Page from '../page-component';
import rendered from '../../../utils/render/render';
import CardsField from '../../cards-field/cards-field';

export default class MainStore extends Page {
  private readonly cardsField: CardsField = new CardsField();

  constructor(id: string) {
    super();
    this.element.id = id;
  }

  public setContent(): void {
    const container: HTMLElement = rendered('div', this.element, 'main__container');
    container.append(this.cardsField.element);
    this.cardsField.render();
  }
}
