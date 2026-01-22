// Типы данных для продуктов
export interface ProductData {
  id: string;
  name: string;
  subtitle: string;
  price: string;
  description: string;
  features: string[];
  specifications: { label: string; value: string }[];
  imageUrl?: string;
  modelPath: string;
}
