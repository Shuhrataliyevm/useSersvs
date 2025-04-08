import { useEffect, useState, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import './products.scss';

interface PhoneNumber {
    id: string;
    created_at: string;
    updated_at: string;
    phone_number: string;
}

interface Image {
    id: string;
    created_at: string;
    updated_at: string;
    image: string;
}

interface Debt {
    id: string;
    created_at: string;
    updated_at: string;
    total_debt_sum: string;
    total_month: number;
    next_payment_date: string;
    debt_status: string;
    debt_period: number;
    debt_sum: string;
    description: string;
}

interface Debtor {
    id: string;
    created_at: string;
    updated_at: string;
    full_name: string;
    address: string;
    description: string;
    phone_numbers: PhoneNumber[];
    images: Image[];
    debts: Debt[];
    is_starred?: boolean;
}

interface ApiResponse {
    status_code: number;
    message: string;
    data: Debtor[];
}

interface ApiError {
    response?: {
        status: number;
        data?: {
            message: string;
        };
    };
    message: string;
}

const LoadingScreen = () => (
    <div className="loading-screen">
        <div className="loading-spinner"></div>
    </div>
);

const Products = () => {
    const [debtors, setDebtors] = useState<Debtor[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [search, setSearch] = useState<string>('');
    const navigate = useNavigate();

    const loadStarredItems = () => {
        const starredItems = localStorage.getItem('starredItems');
        return starredItems ? JSON.parse(starredItems) : {};
    };

    const fetchDebtors = useCallback(async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            const response = await fetch('https://nasiya.takedaservice.uz/api/debtor?skip=0&take=10', {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                if (response.status === 401) {
                    navigate('/login');
                    return;
                }
                throw new Error('Сервер хатоси');
            }

            const result: ApiResponse = await response.json();
            const starredItems = loadStarredItems();
            
            const debtorsWithStars = result.data.map(debtor => ({
                ...debtor,
                is_starred: starredItems[debtor.id] || false
            }));
            
            setDebtors(debtorsWithStars);
            setError(null);
        } catch (err) {
            const error = err as ApiError;
            setError(error.message || "Маълумотларни юклашда хатолик");
            if (error.response?.status === 401) {
                navigate('/login');
            }
        } finally {
            setLoading(false);
        }
    }, [navigate]);

    useEffect(() => {
        fetchDebtors();
        setTimeout(() => setLoading(false), 1500);
    }, [fetchDebtors]);

    const toggleStar = useCallback(async (event: React.MouseEvent, debtorId: string) => {
        event.stopPropagation();
        
        setDebtors(prevDebtors => {
            const newDebtors = prevDebtors.map(d => 
                d.id === debtorId ? { ...d, is_starred: !d.is_starred } : d
            );
            
            const starredItems = loadStarredItems();
            const updatedDebtor = newDebtors.find(d => d.id === debtorId);
            if (updatedDebtor) {
                if (updatedDebtor.is_starred) {
                    starredItems[debtorId] = true;
                } else {
                    delete starredItems[debtorId];
                }
                localStorage.setItem('starredItems', JSON.stringify(starredItems));
            }
            
            return newDebtors;
        });

        try {
            const token = localStorage.getItem('token');
            await fetch(`https://nasiya.takedaservice.uz/api/debtor/star/${debtorId}`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
        } catch (error) {
            console.error('Error toggling star:', error);
        }
    }, []);

    const filteredDebtors = useMemo(() =>
        debtors.filter(debtor => {
            const searchLower = search.toLowerCase();
            return (
                debtor.full_name.toLowerCase().includes(searchLower) ||
                debtor.phone_numbers.some(phone => phone.phone_number.toLowerCase().includes(searchLower)) ||
                debtor.address.toLowerCase().includes(searchLower)
            );
        }), [debtors, search]
    );

    const calculateTotalDebt = (debts: Debt[]): number => {
        if (!debts || debts.length === 0) return 0;
        return debts.reduce((total, debt) => {
            const debtSum = Number(debt.debt_sum) || 0;
            const totalDebtSum = Number(debt.total_debt_sum) || 0;
            return total + (totalDebtSum > 0 ? totalDebtSum : debtSum);
        }, 0);
    };

    const formatCurrency = (amount: number): string => {
        return new Intl.NumberFormat('uz-UZ').format(amount);
    };

    if (loading) return <LoadingScreen />;

    if (error) {
        return (
            <div className="error-container">
                <p className="error-message">{error}</p>
                <button onClick={() => navigate('/login')}>Tizimga kirish</button>
            </div>
        );
    }

    return (
        <div className="products-container">
            <div className="header">
                <h1>Mijozlar</h1>
                <div className="button-group">
                    <button onClick={() => navigate('/create-debtor')}>
                        <span>+</span>
                        <span>Yaratish</span>
                    </button>
                    <button onClick={() => navigate('/profile')} className="profile-button">
                        Profilega qaytish
                    </button>
                </div>
            </div>

            <input
                type="text"
                placeholder="Мижозларни қидириш..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="search-input"
            />

            <div className="debtor-list">
                {filteredDebtors.map((debtor) => {
                    const totalDebt = calculateTotalDebt(debtor.debts);

                    return (
                        <div key={debtor.id} className="debtor-card" onClick={() => navigate(`/news/${debtor.id}`)}>
                            <div className="card-header">
                                <div className="debtor-info">
                                    <h2>{debtor.full_name}</h2>
                                    <p>{debtor.phone_numbers[0]?.phone_number || 'Телефон рақам киритилмаган'}</p>
                                    <p>{debtor.address}</p>
                                </div>
                                <button
                                    onClick={(e) => toggleStar(e, debtor.id)}
                                    className={`star-button ${debtor.is_starred ? 'starred' : ''}`}
                                >
                                    {debtor.is_starred ? '⭐' : '☆'}
                                </button>
                            </div>
                            <p className={`amount ${totalDebt > 0 ? 'negative' : 'positive'}`}>
                                - {formatCurrency(totalDebt)} сўм
                            </p>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default Products;


