import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { IoMail, IoLockClosed, IoEyeOutline, IoEyeOffOutline, IoPersonOutline, IoPhonePortraitOutline } from 'react-icons/io5';
import StatusBar from '../../components/StatusBar/StatusBar';
import './Register.scss';

const Register = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        username: '',
        password: '',
        confirmPassword: '',
        fullName: '',
        phoneNumber: ''
    });
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (formData.password !== formData.confirmPassword) {
            setError('Пароллар мос келмади');
            return;
        }

        if (!formData.phoneNumber.match(/^\+998[0-9]{9}$/)) {
            setError('Телефон рақами нотўғри форматда (+998xxxxxxxxx)');
            return;
        }

        setIsLoading(true);

        try {
            const response = await fetch('https://nasiya.takedaservice.uz/api/auth/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    username: formData.username,
                    password: formData.password,
                    full_name: formData.fullName,
                    phone_number: formData.phoneNumber
                })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Рўйхатдан ўтишда хатолик');
            }

            navigate('/login');
        } catch (err) {
            setError((err as Error).message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="register-container">
            <StatusBar />
            <div className="register-content">
                <div className="register-left">
                    <div className="logo-container">
                        <img src="/icons/newlogo.svg" alt="Logo" />
                    </div>
                    <h2>Рўйхатдан ўтиш</h2>

                    <form onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label>Логин</label>
                            <input
                                type="text"
                                name="username"
                                value={formData.username}
                                onChange={handleChange}
                                placeholder="Логинингизни киритинг"
                                required
                            />
                            <IoMail className="icon" />
                        </div>

                        <div className="form-group">
                            <label>Тўлиқ исм</label>
                            <input
                                type="text"
                                name="fullName"
                                value={formData.fullName}
                                onChange={handleChange}
                                placeholder="Тўлиқ исмингизни киритинг"
                                required
                            />
                            <IoPersonOutline className="icon" />
                        </div>

                        <div className="form-group">
                            <label>Телефон рақами</label>
                            <input
                                type="tel"
                                name="phoneNumber"
                                value={formData.phoneNumber}
                                onChange={handleChange}
                                placeholder="+998xxxxxxxxx"
                                pattern="\+998[0-9]{9}"
                                title="Формат: +998xxxxxxxxx"
                                required
                            />
                            <IoPhonePortraitOutline className="icon" />
                        </div>

                        <div className="form-group">
                            <label>Пароль</label>
                            <input
                                type={showPassword ? "text" : "password"}
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                placeholder="Паролингизни киритинг"
                                required
                            />
                            <IoLockClosed className="icon" style={{ right: '45px' }} />
                            {showPassword ? (
                                <IoEyeOffOutline
                                    className="icon"
                                    onClick={() => setShowPassword(false)}
                                />
                            ) : (
                                <IoEyeOutline
                                    className="icon"
                                    onClick={() => setShowPassword(true)}
                                />
                            )}
                        </div>

                        <div className="form-group">
                            <label>Паролни тасдиқланг</label>
                            <input
                                type={showConfirmPassword ? "text" : "password"}
                                name="confirmPassword"
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                placeholder="Паролни қайта киритинг"
                                required
                            />
                            <IoLockClosed className="icon" style={{ right: '45px' }} />
                            {showConfirmPassword ? (
                                <IoEyeOffOutline
                                    className="icon"
                                    onClick={() => setShowConfirmPassword(false)}
                                />
                            ) : (
                                <IoEyeOutline
                                    className="icon"
                                    onClick={() => setShowConfirmPassword(true)}
                                />
                            )}
                        </div>

                        {error && <div className="error-message">{error}</div>}

                        <button type="submit" className="submit-button" disabled={isLoading}>
                            {isLoading ? (
                                <>
                                    <span className="loading-spinner"></span>
                                    Кутинг...
                                </>
                            ) : (
                                'Рўйхатдан ўтиш'
                            )}
                        </button>

                        <div className="login-link">
                            <p>Аллақачон рўйхатдан ўтганмисиз?</p>
                            <Link to="/login">Кириш</Link>
                        </div>
                    </form>
                </div>

                <div className="register-right">
                    <div className="register-image">
                        <img src="/images/register-illustration.svg" alt="Register" />
                    </div>
                    <h1>Хуш келибсиз!</h1>
                    <p>Рўйхатдан ўтиш учун маълумотларингизни киритинг</p>
                </div>
            </div>
        </div>
    );
};

export default Register;
