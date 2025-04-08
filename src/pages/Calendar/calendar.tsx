import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../../ui/calendar.scss";

const months = [
    "Yanvar", "Fevral", "Mart", "Aprel", "May", "Iyun",
    "Iyul", "Avgust", "Sentabr", "Oktabr", "Noyabr", "Dekabr"
];

const weekDays = ["Du", "Se", "Ch", "Pa", "Ju", "Sh", "Ya"];

interface Payment {
    name: string;
    amount: number;
    date: number;
}

const Calendar = () => {
    const navigate = useNavigate();
    const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
    const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
    const [selectedDay, setSelectedDay] = useState<number | null>(null);
    const [payments] = useState<Payment[]>([
        { name: "Avazbek Jahongirov", amount: 1000000, date: 1 },
        { name: "Otabek Sulaymonov", amount: 1000000, date: 1 }
    ]);

    const getDaysInMonth = (month: number, year: number) => {
        return new Date(year, month + 1, 0).getDate();
    };

    const getFirstDayOfMonth = (month: number, year: number) => {
        return new Date(year, month, 1).getDay() || 7;
    };

    const handleMonthChange = (step: number) => {
        setCurrentMonth((prev) => {
            const newMonth = prev + step;
            if (newMonth > 11) {
                setCurrentYear(prev => prev + 1);
                return 0;
            }
            if (newMonth < 0) {
                setCurrentYear(prev => prev - 1);
                return 11;
            }
            return newMonth;
        });
        setSelectedDay(null);
    };

    const formatAmount = (amount: number) => {
        return new Intl.NumberFormat('uz-UZ').format(amount) + " so'm";
    };

    const getPaymentsForDay = (day: number) => {
        return payments.filter(payment => payment.date === day);
    };

    const renderCalendarDays = () => {
        const daysInMonth = getDaysInMonth(currentMonth, currentYear);
        const firstDay = getFirstDayOfMonth(currentMonth, currentYear);
        const days = [];

        for (let i = 1; i < firstDay; i++) {
            days.push(<div key={`empty-${i}`} className="calendar-day"></div>);
        }

        for (let i = 1; i <= daysInMonth; i++) {
            const dayPayments = getPaymentsForDay(i);
            const hasPayments = dayPayments.length > 0;

            days.push(
                <div
                    key={i}
                    className={`calendar-day ${selectedDay === i ? "selected" : ""} ${hasPayments ? "has-payments" : ""}`}
                    onClick={() => setSelectedDay(i)}
                >
                    {i}
                    {hasPayments && <div className="payment-indicator"></div>}
                </div>
            );
        }

        return days;
    };

    return (
        <div className="calendar-container">
            <div className="calendar-header">
                <button onClick={() => navigate(-1)} className="back-button">⬅</button>
                <h2>Kalendar</h2>
            </div>
            <div className="calendar-body">
                <div className="month-navigation">
                    <button onClick={() => handleMonthChange(-1)} className="nav-button">‹</button>
                    <h3>{months[currentMonth]}, {currentYear}</h3>
                    <button onClick={() => handleMonthChange(1)} className="nav-button">›</button>
                </div>

                <div className="calendar-grid">
                    {weekDays.map((day, index) => (
                        <div key={index} className="calendar-weekday">{day}</div>
                    ))}
                    {renderCalendarDays()}
                </div>

                {selectedDay && (
                    <div className="payment-info">
                        <h4 className="month">{selectedDay} {months[currentMonth]} kuni to'lov kutilmoqda</h4>
                        {getPaymentsForDay(selectedDay).map((payment, index) => (
                            <div key={index} className="payment-card">
                                <p>{payment.name}</p>
                                <span>{formatAmount(payment.amount)}</span>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Calendar;
