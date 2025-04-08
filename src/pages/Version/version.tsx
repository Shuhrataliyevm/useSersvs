import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { IoArrowBack } from 'react-icons/io5';
import { FaPaperPlane } from 'react-icons/fa';
import { toast } from 'react-toastify';
import './version.scss';

const Version = () => {
    const navigate = useNavigate();
    const [message, setMessage] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!message.trim()) {
            toast.error("Iltimos, xabar matnini kiriting");
            return;
        }

        setIsSubmitting(true);
        try {
            const token = localStorage.getItem('token');
            const response = await fetch('https://nasiya.takedaservice.uz/api/feedback', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ message })
            });

            if (!response.ok) {
                throw new Error('Xabar yuborishda xatolik yuz berdi');
            }

            toast.success("Xabaringiz muvaffaqiyatli yuborildi!");
            setMessage('');
        } catch (error) {
            toast.error("Xabar yuborishda xatolik yuz berdi");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="feedback-container">
            <div className="header">
                <button className="back-button" onClick={() => navigate(-1)} title="Orqaga">
                    <IoArrowBack />
                </button>
                <h1>Taklif va shikoyatlar</h1>
            </div>

            <div className="content-wrapper">
                <div className="feedback-content">
                    <div className="emoji-header">
                        <span className="emoji" role="img" aria-label="smile">😊</span>
                        <h2>Odatda bu yerga kamdan-kam kelishadi</h2>
                    </div>

                    <p className="description">
                        Dastur haqida taklif yoki shikoyatlaringiz bo'lsa bizga yozing. 
                        Albatta sizning fikringiz biz uchun juda muhim.
                    </p>

                    <form onSubmit={handleSubmit} className="feedback-form">
                        <div className="textarea-wrapper">
                            <textarea
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                placeholder="Xabar yozing..."
                                rows={6}
                                className="feedback-input"
                            />
                            <div className="textarea-border" />
                        </div>

                        <button 
                            type="submit" 
                            className={`submit-button ${isSubmitting ? 'submitting' : ''}`}
                            disabled={isSubmitting}
                        >
                            <span className="button-content">
                                <FaPaperPlane className="send-icon" />
                                <span className="button-text">
                                    {isSubmitting ? 'Yuborilmoqda...' : 'Yuborish'}
                                </span>
                            </span>
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Version;