export type CardData = {
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

export interface Subject {
  attachObserver(observer: Observer): void;
  removeObserver(observer: Observer): void;
  notifyObserver(): void;
}

export interface Observer {
  update(subject: Subject): void;
}
