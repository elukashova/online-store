import Header from '../header/header';
import Footer from '../footer/footer';

export default class App {
  private readonly header: Header = new Header();

  private readonly footer: Footer = new Footer();

  constructor(private readonly rootElement: HTMLElement) {}

  public init(): void {
    this.rootElement.classList.add('root'); // добавляю класс к боди для стилей
    this.rootElement.append(this.header.element, this.footer.element);
    this.header.render();
    this.footer.render();
  }
}
