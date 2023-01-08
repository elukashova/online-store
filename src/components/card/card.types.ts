export type CardDataType = {
  id: number;
  title: string;
  description: string;
  price: number;
  discountPercentage: number;
  rating: number;
  size: string;
  stock: number;
  category: string;
  images: string[];
};

export interface ObservedSubject {
  attachObserver(observer: Observer): void;
  removeObserver(observer: Observer): void;
  notifyObserver(): void;
}

export interface Observer {
  update(subject: ObservedSubject, e?: Event): void;
}
