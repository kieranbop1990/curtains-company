export interface Product {
    id: string;
    attributes: string[];
    name: string;
    status: 'completed' | 'pending';
    updatedAt: number;
}
