export interface Quotation {
    clientAddress: string; 
    clientCompany: string;
    clientEmail: string;
    clientName: string;
    clientPhone: string;
    createdAt: string;
    quotationItems: {
        productId: number;
        name: string;
        grammage: string;
        quantity: number;
        imageName?: string;
    }[];
}
