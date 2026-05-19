export interface Product {
  category: string;
  name: string;
  extraInfo: boolean
}

export interface Extras {
  name: string
  quantity?: number
}
