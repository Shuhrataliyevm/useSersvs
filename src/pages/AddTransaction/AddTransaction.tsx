import { useNavigate, useParams } from 'react-router-dom';
import './AddTransaction.scss';
import { useForm, useWatch } from "react-hook-form";
import { useMutation, useQueryClient } from '@tanstack/react-query';
import API from '../../utils/API';
import { toast } from 'sonner';
import { IoArrowBack } from 'react-icons/io5';

interface ApiError {
    response?: {
        data?: {
            error?: {
                message?: string;
            };
        };
    };
}

interface DebtForm {
    next_payment_date: string;
    debt_period: number;
    debt_sum: number;
    total_debt_sum: number;
    description: string;
    debtor: string;
    debt_status: string;
}

const formatDateToISO = (date: string): string => {
    const d = new Date(date);
    return d.toISOString().split('.')[0] + 'Z';
};

const AddTransaction = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const queryClient = useQueryClient();

    const {
        register,
        handleSubmit,
        formState: { errors },
        control
    } = useForm<DebtForm>({
        defaultValues: {
            next_payment_date: new Date().toISOString().split('T')[0],
            debt_period: 1,
            debt_sum: 0,
            total_debt_sum: 0,
            description: '',
            debtor: id || '',
            debt_status: 'active'
        }
    });

    const debt_sum = useWatch({
        control,
        name: 'debt_sum',
        defaultValue: 0
    });

    const total_debt_sum = useWatch({
        control,
        name: 'total_debt_sum',
        defaultValue: 0
    });

    const { mutate: createDebt, isPending } = useMutation({
        mutationFn: async (formData: DebtForm) => {
            const requestData = {
                ...formData,
                next_payment_date: formatDateToISO(formData.next_payment_date),
                debt_period: Number(formData.debt_period),
                debt_sum: Number(formData.debt_sum),
                total_debt_sum: formData.total_debt_sum || formData.debt_sum,
                description: formData.description.trim(),
                debtor: id
            };

            console.log('Отправляемые данные:', requestData); 
            const { data } = await API.post('/debts', requestData);
            return data;
        },
        onSuccess: () => {
            toast.success('Muvaffaqiyatli qo\'shildi');
            queryClient.invalidateQueries({ queryKey: ['debts', id] });
            navigate(`/news/${id}`);
        },
        onError: (error: ApiError) => {
            const message = error.response?.data?.error?.message || 'Xatolik yuz berdi';
            toast.error(message);
            console.error('Error details:', error); 
        }
    });

    const onSubmit = (data: DebtForm) => {
        if (!id) {
            toast.error('Debtor ID topilmadi');
            return;
        }

        if (data.debt_period < 1 || data.debt_period > 12) {
            toast.error('Muddat 1 dan 12 oygacha bo\'lishi kerak');
            return;
        }

        createDebt(data);
    };

    return (
        <div className="transaction-form">
            <div className="form-header">
                <button 
                    type="button" 
                    className="back-button" 
                    onClick={() => navigate(`/news/${id}`)}
                    aria-label="Orqaga qaytish"
                >
                    <IoArrowBack />
                </button>
                <h1>Yangi qarz qo'shish</h1>
            </div>

            <form onSubmit={handleSubmit(onSubmit)}>
                <div className="form-group">
                    <label htmlFor="next_payment_date">Keyingi to'lov sanasi</label>
                    <input
                        type="date"
                        id="next_payment_date"
                        {...register('next_payment_date', { required: true })}
                        min={new Date().toISOString().split('T')[0]}
                    />
                    {errors.next_payment_date && (
                        <span className="error-message">Bu maydon to'ldirilishi shart</span>
                    )}
                </div>

                <div className="form-group">
                    <label htmlFor="debt_period">Muddat (oy)</label>
                    <select
                        id="debt_period"
                        {...register('debt_period', { 
                            required: true,
                            min: 1,
                            max: 12
                        })}
                    >
                        {[...Array(12)].map((_, i) => (
                            <option key={i + 1} value={i + 1}>{i + 1}</option>
                        ))}
                    </select>
                    {errors.debt_period && (
                        <span className="error-message">Muddat 1 dan 12 oygacha bo'lishi kerak</span>
                    )}
                </div>

                <div className="form-group">
                    <label htmlFor="debt_sum">Qarz summasi</label>
                    <input
                        type="number"
                        id="debt_sum"
                        {...register('debt_sum', { 
                            required: true,
                            min: 1
                        })}
                        placeholder="5845000"
                    />
                    {errors.debt_sum && (
                        <span className="error-message">To'g'ri summa kiriting</span>
                    )}
                    <div className="formatted-amount">
                        {new Intl.NumberFormat('uz-UZ').format(Number(debt_sum))} so'm
                    </div>
                </div>

                <div className="form-group">
                    <label htmlFor="total_debt_sum">Umumiy qarz summasi</label>
                    <input
                        type="number"
                        id="total_debt_sum"
                        {...register('total_debt_sum')}
                        placeholder="6000000"
                    />
                    {total_debt_sum > 0 && (
                        <div className="formatted-amount">
                            {new Intl.NumberFormat('uz-UZ').format(Number(total_debt_sum))} so'm
                        </div>
                    )}
                </div>

                <div className="form-group">
                    <label htmlFor="description">Izoh</label>
                    <textarea
                        id="description"
                        {...register('description', { required: true })}
                        placeholder="iPhone 14 Pro, boshlang'ich to'lov bor"
                    />
                    {errors.description && (
                        <span className="error-message">Bu maydon to'ldirilishi shart</span>
                    )}
                </div>

                <button 
                    type="submit" 
                    className="submit-button" 
                    disabled={isPending}
                >
                    {isPending ? 'Yuklanmoqda...' : 'Qo\'shish'}
                </button>
            </form>
        </div>
    );
};

export default AddTransaction; 