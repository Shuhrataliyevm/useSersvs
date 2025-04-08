import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import './News.scss';
import { IoArrowBack, IoAdd } from 'react-icons/io5';
import { FormProvider, useForm } from 'react-hook-form';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import API from '../../utils/API';

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

interface ApiResponse<T = unknown> {
    status_code: number;
    message: string;
    data: T;
}

type DebtForm = {
    next_payment_date: string;
    debt_period: number;
    debt_sum: number;
    total_debt_sum: number;
    description: string;
    images: {
        image: string;
    }[];
    debtor: string;
    debt_status: string;
}

const News = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const [loading, setLoading] = useState(true);
    const [debts, setDebts] = useState<Debt[]>([]);
    const [debtorName, setDebtorName] = useState('');
    const [error, setError] = useState<string | null>(null);
    const methods = useForm<DebtForm>();
    const queryClient = useQueryClient();
    const [formData, setFormData] = useState({
        date: new Date().toISOString().split('T')[0],
        time: new Date().toLocaleTimeString().slice(0, 5),
        duration: '',
        amount: '',
        note: '',
        images: [] as File[],
    });

    const { mutate: createDebt, isPending } = useMutation({
        mutationFn: async (formData: DebtForm) => {
            const { data } = await API.post('/debts', formData);
            return data;
        },
        onSuccess: () => {
            methods.reset();
            toast.success('Qarz muvaffaqiyatli qo\'shildi');
            queryClient.invalidateQueries({ queryKey: ['debts', id] });
            fetchDebtorDetails();
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || 'Xatolik yuz berdi');
        }
    });

    const fetchDebtorDetails = async () => {
        if (!id) {
            navigate('/products');
            return;
        }

        try {
            const token = localStorage.getItem('token');
            if (!token) {
                navigate('/login');
                return;
            }

            const debtorResponse = await fetch(`https://nasiya.takedaservice.uz/api/debtor/${id}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!debtorResponse.ok) {
                if (debtorResponse.status === 401) {
                    navigate('/login');
                    return;
                }
                throw new Error('Mijoz ma\'lumotlarini olishda xatolik');
            }

            const debtorData: ApiResponse<{ full_name: string }> = await debtorResponse.json();
            if (!debtorData.data || !debtorData.data.full_name) {
                throw new Error('Mijoz ma\'lumotlari topilmadi');
            }
            setDebtorName(debtorData.data.full_name);

            const debtsResponse = await fetch(`https://nasiya.takedaservice.uz/api/debts?debtor_id=${id}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!debtsResponse.ok) {
                throw new Error('Qarzlar ro\'yxatini olishda xatolik');
            }

            const debtsData: ApiResponse<Debt[]> = await debtsResponse.json();
            if (Array.isArray(debtsData.data)) {
                setDebts(debtsData.data);
            } else {
                setDebts([]);
            }
            setError(null);
        } catch (err) {
            console.error('Error:', err);
            setError(err instanceof Error ? err.message : 'Xatolik yuz berdi');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDebtorDetails();
    }, [id, navigate]);

    const formatCurrency = (amount: string | number): string => {
        try {
            const numericAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
            if (isNaN(numericAmount)) return '0';
            return new Intl.NumberFormat('uz-UZ').format(numericAmount);
        } catch {
            return '0';
        }
    };

    const formatDate = (dateString: string): string => {
        try {
            const date = new Date(dateString);
            if (isNaN(date.getTime())) return 'Sana noto\'g\'ri';
            return date.toLocaleDateString('uz-UZ');
        } catch {
            return 'Sana noto\'g\'ri';
        }
    };

    const handleSubmit = (data: DebtForm) => {
        const newData: DebtForm = {
            next_payment_date: data.next_payment_date,
            debt_period: Number(data.debt_period),
            debt_sum: data.debt_sum,
            total_debt_sum: Number(data.total_debt_sum),
            description: data.description,
            debtor: id as string,
            debt_status: 'active',
            images: [
                {
                    image: '',
                },
                {
                    image: '',
                }
            ]
        };
        createDebt(newData);
    };

    if (loading) {
        return (
            <div className="loading-screen">
                <div className="loading-spinner"></div>
                <p>Yuklanmoqda...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="error-container">
                <div className="error-content">
                    <p className="error-message">{error}</p>
                    <button className="back-button" onClick={() => navigate('/products')}>
                        Orqaga qaytish
                    </button>
                </div>
            </div>
        );
    }

    const totalDebt = debts.reduce((sum, debt) => {
        const amount = parseFloat(debt.debt_sum);
        return sum + (isNaN(amount) ? 0 : amount);
    }, 0);


return (
    <div className="debtor-details">
        <div className="header">
            <button 
                className="back-button" 
                onClick={() => navigate('/products')} 
                title="Orqaga"
            >
                <IoArrowBack />
            </button>
            <h1>{debtorName || 'Ism ko\'rsatilmagan'}</h1>
        </div>

        <div className="debt-header">
            <h2>Umumiy qarzi</h2>
            <div className="total-amount">
                {formatCurrency(totalDebt)} so'm
            </div>
        </div>

        <h2 className="section-title">Qarzlar tarixi</h2>

        <div className="transactions-list">
            {debts.length === 0 ? (
                <div className="no-debts">
                    <p>Qarzlar mavjud emas</p>
                </div>
            ) : (
                debts.map((debt) => (
                    <div key={debt.id} className="transaction-item">
                        <div className="transaction-header">
                            <div className="transaction-date">
                                {formatDate(debt.created_at)}
                            </div>
                            <div className="transaction-amount">
                                {formatCurrency(debt.debt_sum)} so'm
                            </div>
                        </div>

                        <div className="payment-info">
                            <div className="next-payment">
                                Keyingi to'lov: {formatDate(debt.next_payment_date)}
                            </div>
                            <div className="payment-amount">
                                Oylik to'lov: {formatCurrency(parseFloat(debt.total_debt_sum) / (debt.total_month || 1))} so'm
                            </div>
                        </div>

                        {debt.description && (
                            <div className="description">
                                {debt.description}
                            </div>
                        )}

                        <div className="progress-bar">
                            <div
                                className="progress"
                                style={{
                                    width: `${(parseFloat(debt.debt_sum) / parseFloat(debt.total_debt_sum)) * 100}%`
                                }}
                            />
                        </div>
                    </div>
                ))
            )}

            <FormProvider {...methods}>
                <form onSubmit={methods.handleSubmit(handleSubmit)} className="transaction-form">
                    <div className="form-group">
                        <label htmlFor="next_payment_date">
                            Keyingi to'lov sanasi <span className="required">*</span>
                        </label>
                        <input
                            type="date"
                            id="next_payment_date"
                            {...methods.register('next_payment_date')}
                            placeholder="Keyingi to'lov sanasi"
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="debt_period">
                            Qarz muddati (oy) <span className="required">*</span>
                        </label>
                        <input
                            type="number"
                            id="debt_period"
                            {...methods.register('debt_period')}
                            placeholder="Qarz muddati"
                            min="1"
                            max="12"
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="debt_sum">
                            Qarz miqdori <span className="required">*</span>
                        </label>
                        <input
                            type="number"
                            id="debt_sum"
                            {...methods.register('debt_sum')}
                            placeholder="Qarz miqdori"
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="total_debt_sum">
                            Umumiy qarz miqdori <span className="required">*</span>
                        </label>
                        <input
                            type="number"
                            id="total_debt_sum"
                            {...methods.register('total_debt_sum')}
                            placeholder="Umumiy qarz miqdori"
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="description">Izoh</label>
                        <input
                            type="text"
                            id="description"
                            {...methods.register('description')}
                            placeholder="Izoh"
                        />
                    </div>

                    <div className="image-upload">
                        <div className="upload-title">Rasm biriktirish</div>
                        <div className="image-upload-container">
                            <label className="image-upload-box">
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => {
                                        if (e.target.files?.[0]) {
                                            setFormData((prev) => ({
                                                ...prev,
                                                images: [
                                                    e.target.files![0],
                                                    prev.images[1],
                                                ].filter(Boolean),
                                            }));
                                        }
                                    }}
                                    hidden
                                />
                                {formData.images[0] ? (
                                    <img
                                        src={URL.createObjectURL(formData.images[0])}
                                        alt="Preview"
                                        className="preview-image"
                                    />
                                ) : (
                                    <>
                                        <span className="upload-icon">📷</span>
                                        <span>Расм қўшиш</span>
                                    </>
                                )}
                            </label>

                            <label className="image-upload-box">
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => {
                                        if (e.target.files?.[0]) {
                                            setFormData((prev) => ({
                                                ...prev,
                                                images: [
                                                    prev.images[0],
                                                    e.target.files![0],
                                                ].filter(Boolean),
                                            }));
                                        }
                                    }}
                                    hidden
                                />
                                {formData.images[1] ? (
                                    <img
                                        src={URL.createObjectURL(formData.images[1])}
                                        alt="Preview"
                                        className="preview-image"
                                    />
                                ) : (
                                    <>
                                        <span className="upload-icon">📷</span>
                                        <span>Расм қўшиш</span>
                                    </>
                                )}
                            </label>
                        </div>
                    </div>

                    <button 
                        type="submit" 
                        className="submit-button" 
                        disabled={isPending}
                    >
                        {isPending ? 'Yuklanmoqda...' : 'Qarz qo\'shish'}
                    </button>
                </form>
            </FormProvider>
        </div>
    </div>
);
};

export default News;