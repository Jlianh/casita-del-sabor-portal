export interface Quotation {
    clientAddress: string; 
    clientCompany: string;
    clientEmail: string;
    clientName: string;
    clientPhone: string;
    createdAt: string;
    quotationItems: {
        endowmentId: number;
        sizeId?: number;
        colorId?: number;
        quantity: number;
        imageName?: string;
    }[];
}
