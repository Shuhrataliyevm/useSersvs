import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { IoMail, IoLockClosed, IoEyeOutline, IoEyeOffOutline, IoWifi, IoBatteryFull, IoBatteryHalf, IoBatteryDead } from 'react-icons/io5';
import './Login.scss';

interface NetworkStatus {
    online: boolean;
    strength: number;
    type: 'wifi' | 'cellular' | 'none';
}

interface NetworkConnection {
    downlink: number;
    effectiveType: string;
    rtt: number;
    type: string;
    saveData: boolean;
    addEventListener: (type: string, listener: () => void) => void;
    removeEventListener: (type: string, listener: () => void) => void;
}

interface NavigatorWithConnection extends Navigator {
    connection?: NetworkConnection;
}

interface NavigatorWithBattery extends Navigator {
    getBattery?: () => Promise<{
        level: number;
        charging: boolean;
        addEventListener: (type: string, listener: () => void) => void;
        removeEventListener: (type: string, listener: () => void) => void;
    }>;
}

const Login = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        login: '',
        password: ''
    });
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [currentTime, setCurrentTime] = useState('');
    const [networkStatus, setNetworkStatus] = useState<NetworkStatus>({
        online: navigator.onLine,
        strength: 4,
        type: 'wifi'
    });
    const [batteryStatus, setBatteryStatus] = useState({
        level: 1,
        charging: false
    });

    useEffect(() => {
        const updateTime = () => {
            const now = new Date();
            const hours = now.getHours().toString().padStart(2, "0");
            const minutes = now.getMinutes().toString().padStart(2, "0");
            setCurrentTime(`${hours}:${minutes}`);
        };

        updateTime();
        const interval = setInterval(updateTime, 60000);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        const updateNetworkStatus = () => {
            const navigatorWithConnection = navigator as NavigatorWithConnection;
            const connection = navigatorWithConnection.connection;

            if (connection) {
                const strength = Math.min(Math.floor(connection.downlink / 2), 4);
                setNetworkStatus({
                    online: navigator.onLine,
                    strength: strength,
                    type: connection.type === 'wifi' ? 'wifi' : 'cellular'
                });
            }
        };

        const handleOnline = () => {
            setNetworkStatus(prev => ({ ...prev, online: true }));
        };

        const handleOffline = () => {
            setNetworkStatus(prev => ({ ...prev, online: false }));
        };

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        const navigatorWithConnection = navigator as NavigatorWithConnection;
        if (navigatorWithConnection.connection) {
            navigatorWithConnection.connection.addEventListener('change', updateNetworkStatus);
        }

        updateNetworkStatus();

        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
            if (navigatorWithConnection.connection) {
                navigatorWithConnection.connection.removeEventListener('change', updateNetworkStatus);
            }
        };
    }, []);

    useEffect(() => {
        const updateBatteryStatus = async () => {
            try {
                const navigatorWithBattery = navigator as NavigatorWithBattery;
                if (!navigatorWithBattery.getBattery) {
                    return;
                }

                const battery = await navigatorWithBattery.getBattery();

                const updateStatus = () => {
                    setBatteryStatus({
                        level: battery.level,
                        charging: battery.charging
                    });
                };

                battery.addEventListener('levelchange', updateStatus);
                battery.addEventListener('chargingchange', updateStatus);

                updateStatus();

                return () => {
                    battery.removeEventListener('levelchange', updateStatus);
                    battery.removeEventListener('chargingchange', updateStatus);
                };
            } catch {
                console.log('Battery API не поддерживается');
            }
        };

        updateBatteryStatus();
    }, []);

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
        setIsLoading(true);

        try {
            const response = await fetch('https://nasiya.takedaservice.uz/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    login: formData.login,
                    hashed_password: formData.password
                })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Login yoki parol xato!');
            }

            localStorage.setItem('token', data.accessToken);
            localStorage.setItem('username', formData.login);
            navigate('/profile');
        } catch (err) {
            setError((err as Error).message);
        } finally {
            setIsLoading(false);
        }
    };

    const renderBatteryIcon = () => {
        const batteryPercent = Math.round(batteryStatus.level * 100);
        const batteryColor = batteryStatus.charging ? '#4CAF50' :
            batteryPercent <= 20 ? '#e74c3c' : '#2c3e50';

        return (
            <div className="battery-status">
                {batteryStatus.level > 0.7 ? (
                    <IoBatteryFull className="battery-icon" style={{ color: batteryColor }} />
                ) : batteryStatus.level > 0.3 ? (
                    <IoBatteryHalf className="battery-icon" style={{ color: batteryColor }} />
                ) : (
                    <IoBatteryDead className="battery-icon" style={{ color: batteryColor }} />
                )}
                <span className="battery-percent" style={{ color: batteryColor }}>
                    {batteryPercent}%
                </span>
            </div>
        );
    };

    const renderSignalBars = () => {
        const bars = [];
        const maxBars = 4;
        const activeColor = networkStatus.online ? '#2c3e50' : '#95a5a6';
        const inactiveColor = '#e0e0e0';

        for (let i = 0; i < maxBars; i++) {
            bars.push(
                <div
                    key={i}
                    className="signal-bar"
                    style={{
                        backgroundColor: i < networkStatus.strength ? activeColor : inactiveColor,
                        height: `${(i + 1) * 3}px`,
                        width: '2px',
                        marginRight: '1px'
                    }}
                />
            );
        }

        return <div className="signal-bars">{bars}</div>;
    };

    return (
        <div className="login-container">
            <div className="login-background"></div>

            <div className="status-bar">
                <span className="time">{currentTime}</span>
                <div className="icons">
                    {renderSignalBars()}
                    <IoWifi className="wifi-icon" style={{
                        color: networkStatus.type === 'wifi' && networkStatus.online ? '#2c3e50' : '#95a5a6',
                        opacity: networkStatus.type === 'wifi' ? 1 : 0.3
                    }} />
                    {renderBatteryIcon()}
                </div>
            </div>

            <div className="login-content">
                <div className="login-left">
                    <div className="login-image">
                        <img src="/images/login enter pictures.png" alt="Login" />
                    </div>
                    <h1>Xush kelibsiz!</h1>
                    <p>Dasturga kirish uchun ma'lumotlaringizni kiriting</p>
                </div>

                <div className="login-right">
                    <div className="logo-container">
                        <img src="/icons/LOGO.svg" alt="Logo" />
                    </div>
                    <h2>Dasturga kirish</h2>
                    <p className="login-description">
                        Iltimos, dasturga kirish uchun login va<br />
                        parolingizni kiriting
                    </p>

                    <form onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label>Login</label>
                            <input
                                type="text"
                                name="login"
                                value={formData.login}
                                onChange={handleChange}
                                placeholder="Loginingizni kiriting"
                                required
                            />
                            <IoMail className="icon" />
                        </div>

                        <div className="form-group">
                            <label>Parol</label>
                            <input
                                type={showPassword ? "text" : "password"}
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                placeholder="Parolingizni kiriting"
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

                        {error && <div className="error-message">{error}</div>}

                        <button type="submit" className="submit-button" disabled={isLoading}>
                            {isLoading ? (
                                <>
                                    <span className="loading-spinner"></span>
                                    Kirish...
                                </>
                            ) : (
                                'Kirish'
                            )}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Login;
