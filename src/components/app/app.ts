/* eslint-disable import/no-named-as-default */
import Header from '../header/header';
import Footer from '../footer/footer';
import CardsField from '../cards-field/cards-field';

export default class App {
  private readonly header: Header = new Header();

  private readonly footer: Footer = new Footer();

  private readonly cardsField: CardsField = new CardsField();

  constructor(private readonly rootElement: HTMLElement) {}

  public init(): void {
    this.rootElement.classList.add('root'); // добавляю класс к боди для стилей
    this.rootElement.append(this.header.element, this.cardsField.element, this.footer.element);
    this.header.render();
    this.footer.render();
    this.cardsField.render();
  }
}
