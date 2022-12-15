import './footer.styles.css';
import BaseComponent from '../base-component/base-component';
import rendered from '../../utils/render/render';

export default class Footer extends BaseComponent {
  constructor() {
    super('footer', 'footer');
  }

  public render(): void {
    const container: HTMLElement = rendered('div', this.element, 'footer__container');
    const contactsContainer: HTMLElement = rendered('div', container, 'footer__contacts-container contacts-container');
    rendered('img', container, 'footer__image', '', { src: '../../../assets/images/placeholder-image.jpg' });
    rendered('p', contactsContainer, 'contacts-container__title', 'Have some questions?\nContact us');
    const contactsInfo: HTMLElement = rendered('div', contactsContainer, 'contacts-container__info');
    rendered('p', contactsInfo, 'contacts-container__info-office', 'Office ');
    rendered('p', contactsInfo, 'contacts-container__info-address', 'Lisboa, Avenida da Liberdade, 3');
    rendered('p', contactsInfo, 'contacts-container__info-phone', 'Tel. ');
    rendered('p', contactsInfo, 'contacts-container__info-phone-number', '+351-01-341-3961');
    rendered('p', contactsInfo, 'contacts-container__info-email', 'Email ');
    rendered('p', contactsInfo, 'contacts-container__info-email-address', 'bestposterever@gmail.com');
    const contactsSocialMedia: HTMLElement = rendered('div', contactsInfo, 'contacts-container__social-media');
    const socialLinkInstagram: HTMLElement = rendered('a', contactsSocialMedia, 'contacts-container__instagram', '', {
      href: '#',
    });
    const socialLinkFacebook: HTMLElement = rendered('a', contactsSocialMedia, 'contacts-container__facebook', '', {
      href: '#',
    });
    const socialLinkTwitter: HTMLElement = rendered('a', contactsSocialMedia, 'contacts-container__twitter', '', {
      href: '#',
    });
    rendered('img', socialLinkInstagram, 'contacts-container__instagram-logo', '', {
      src: '../../../assets/icons/logo-placeholder.svg',
    });
    rendered('img', socialLinkFacebook, 'contacts-container__facebook-logo', '', {
      src: '../../../assets/icons/logo-placeholder.svg',
    });
    rendered('img', socialLinkTwitter, 'contacts-container__twitter-logo', '', {
      src: '../../../assets/icons/logo-placeholder.svg',
    });
  }
}
