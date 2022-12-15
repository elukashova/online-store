import Header from '../header/header';

export default class App {
  private readonly header: Header;

  constructor(private readonly rootElement: HTMLElement) {
    this.header = new Header();
    this.rootElement = rootElement;
  }

  public init(): void {
    this.rootElement.classList.add('root'); //добавляю класс к боди для стилей
    this.rootElement.appendChild(this.header.element); //вешаю хедер
    this.header.render();
  }
}
