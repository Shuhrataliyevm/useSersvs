import axios, { AxiosError } from 'axios';

const BASE_URL = 'https://nasiya.takedaservice.uz/api';

const getToken = () => {
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    return token;
};

const api = axios.create({
    baseURL: BASE_URL,
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
    }
});

api.interceptors.request.use((config) => {
    const token = getToken();
    if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('token');
            sessionStorage.removeItem('token');
        }
        return Promise.reject(error);
    }
);

interface DebtorResponse {
    id: string;
    created_at?: string;
    updated_at?: string;
    full_name?: string;
    address?: string;
    description?: string;
    store?: string;
    phone_numbers?: string[] | string | { [key: string]: string };
    images?: string[];
    amount?: number | string;
    is_starred?: boolean;
}

interface Debtor {
    id: string;
    created_at: string;
    updated_at: string;
    full_name: string;
    address: string;
    description: string;
    store: string;
    phone_numbers: string[];
    images: string[];
    amount: number;
    is_starred: boolean;
}

interface Transaction {
    id: string;
    created_at: string;
    amount: number;
    paid_amount: number;
    next_payment_date: string;
    next_payment_amount: number;
}

interface DebtorDetails {
    id: string;
    full_name: string;
    total_amount: number;
    transactions: Transaction[];
    is_starred: boolean;
}

const formatPhoneNumbers = (phones: DebtorResponse['phone_numbers']): string[] => {
    if (!phones) return [];
    
    if (Array.isArray(phones)) {
        return phones
            .map(item => (item as any)?.phone_number || '')
            .filter(phone => phone && phone.trim() !== '');
    }
    
    if (typeof phones === 'string') {
        return [phones];
    }
    
    if (typeof phones === 'object') {
        const values = Object.values(phones);
        if (values.length > 0 && typeof values[0] === 'object') {
            return values
                .map(item => (item as any)?.phone_number || '')
                .filter(phone => phone && phone.trim() !== '');
        }
        return values
            .filter(Boolean)
            .map(phone => phone.toString())
            .filter(phone => phone.trim() !== '');
    }
    
    return [];
};

const formatDebtor = (data: DebtorResponse): Debtor => {
    const now = new Date().toISOString();
    const phoneNumbers = formatPhoneNumbers(data.phone_numbers);
    
    return {
        id: data.id,
        created_at: data.created_at || now,
        updated_at: data.updated_at || now,
        full_name: data.full_name || '',
        address: data.address || 'toshkent',
        description: data.description || '',
        store: data.store || '',
        phone_numbers: phoneNumbers,
        images: Array.isArray(data.images) ? data.images : [],
        amount: typeof data.amount === 'string' ? parseFloat(data.amount) : (Number(data.amount) || 0),
        is_starred: Boolean(data.is_starred)
    };
};

const ProfileApi = {
    getDebtors: async (): Promise<Debtor[]> => {
        try {
            const token = getToken();
            if (!token) {
                throw new Error('Avtorizatsiya zarur');
            }

            const response = await api.get('/debtor');
            
            if (!response.data || !response.data.data) {
                throw new Error("Ma'lumotlar topilmadi");
            }

            const debtors = Array.isArray(response.data.data) ? response.data.data : [];
            return debtors.map(formatDebtor);
        } catch (error) {
            if (error instanceof AxiosError && error.response?.status === 401) {
                throw new Error('Avtorizatsiya muddati tugagan');
            }
            throw error;
        }
    },

    getDebtorDetails: async (id: string): Promise<DebtorDetails> => {
        try {
            const token = getToken();
            if (!token) {
                throw new Error('Avtorizatsiya zarur');
            }

            const response = await api.get(`/debtor/${id}`);
            
            if (!response.data) {
                throw new Error("Ma'lumotlar topilmadi");
            }

            return {
                id: response.data.id,
                full_name: response.data.full_name || '',
                total_amount: typeof response.data.amount === 'string' ? 
                    parseFloat(response.data.amount) : 
                    (Number(response.data.amount) || 0),
                transactions: Array.isArray(response.data.transactions) ? 
                    response.data.transactions.map((t: any) => ({
                        id: t.id,
                        created_at: t.created_at,
                        amount: Number(t.amount) || 0,
                        paid_amount: Number(t.paid_amount) || 0,
                        next_payment_date: t.next_payment_date,
                        next_payment_amount: Number(t.next_payment_amount) || 0
                    })) : [],
                is_starred: Boolean(response.data.is_starred)
            };
        } catch (error) {
            if (error instanceof AxiosError && error.response?.status === 401) {
                throw new Error('Avtorizatsiya muddati tugagan');
            }
            throw error;
        }
    },

    toggleStar: async (debtorId: string): Promise<void> => {
        try {
            const token = getToken();
            if (!token) {
                throw new Error('Avtorizatsiya zarur');
            }

            await api.post(`/debtor/toggle-star/${debtorId}`);
        } catch (error) {
            if (error instanceof AxiosError && error.response?.status === 401) {
                throw new Error('Avtorizatsiya muddati tugagan');
            }
            throw error;
        }
    }
};

export default ProfileApi;