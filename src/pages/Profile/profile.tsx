import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    IoWalletOutline, IoPersonOutline, IoEyeOutline, IoEyeOffOutline,
    IoBatteryFull, IoBatteryHalf, IoBatteryDead, IoWifi
} from 'react-icons/io5';
import "./Profile.scss";

interface NetworkStatus {
    online: boolean;
    strength: number;
    type: 'wifi' | 'cellular' | 'none';
}

interface ProfileData {
    totalDebt: number;
    delayedPayments: number;
    totalClients: number;
    accountBalance: number;
    monthlyPaymentStatus: string;
}

const LoadingScreen = () => (
    <div className="loading-screen">
        <div className="loading-spinner"></div>
    </div>
);

const Profile = () => {
    const navigate = useNavigate();
    const username = localStorage.getItem("username") || "Foydalanuvchi";
    const [currentTime, setCurrentTime] = useState("");
    const [isAmountVisible, setIsAmountVisible] = useState(true);
    const [isLoading, setIsLoading] = useState(true);
    const [batteryStatus, setBatteryStatus] = useState({ level: 1, charging: false });
    const [networkStatus, setNetworkStatus] = useState<NetworkStatus>({
        online: navigator.onLine,
        strength: 4,
        type: 'wifi'
    });

    const profileData: ProfileData = {
        totalDebt: 135214200,
        delayedPayments: 26,
        totalClients: 151,
        accountBalance: 300000,
        monthlyPaymentStatus: "To'lov qilingan"
    };

    useEffect(() => {
        const updateTime = () => {
            const now = new Date();
            const hours = now.getHours().toString().padStart(2, "0");
            const minutes = now.getMinutes().toString().padStart(2, "0");
            setCurrentTime(`${hours}:${minutes}`);
        };

        const updateBattery = async () => {
            try {
                if ('getBattery' in navigator) {
                    const battery = await (navigator as any).getBattery();
                    const updateStatus = () => {
                        setBatteryStatus({ level: battery.level, charging: battery.charging });
                    };
                    battery.addEventListener("levelchange", updateStatus);
                    battery.addEventListener("chargingchange", updateStatus);
                    updateStatus();
                }
            } catch (error) {
                console.log("Battery API qo'llab-quvvatlanmaydi");
            }
        };

        const updateNetworkInfo = () => {
            const connection = (navigator as any).connection;
            if (connection) {
                const strength = Math.min(Math.floor(connection.downlink / 2), 4);
                setNetworkStatus({
                    online: navigator.onLine,
                    strength,
                    type: connection.type === "wifi" ? "wifi" : "cellular"
                });
            }
        };

        updateTime();
        updateBattery();
        updateNetworkInfo();

        const timeInterval = setInterval(updateTime, 60000);
        const networkInterval = setInterval(updateNetworkInfo, 10000);
        const loadingTimeout = setTimeout(() => setIsLoading(false), 1500);

        return () => {
            clearInterval(timeInterval);
            clearInterval(networkInterval);
            clearTimeout(loadingTimeout);
        };
    }, []);

    const handleLogout = () => {
        localStorage.clear();
        navigate("/login");
    };

    const formatCurrency = (amount: number): string => {
        return new Intl.NumberFormat("uz-UZ").format(amount);
    };

    const renderBatteryIcon = () => {
        const batteryPercent = Math.round(batteryStatus.level * 100);
        const batteryColor = batteryStatus.charging
            ? '#4CAF50'
            : batteryPercent <= 20
                ? '#e74c3c'
                : '#2c3e50';

        const BatteryIcon = batteryStatus.level > 0.7
            ? IoBatteryFull
            : batteryStatus.level > 0.3
                ? IoBatteryHalf
                : IoBatteryDead;

        return (
            <div className="battery-status">
                <BatteryIcon className="battery-icon" style={{ color: batteryColor }} />
                <span className="battery-percent" style={{ color: batteryColor }}>
                    {batteryPercent}%
                </span>
            </div>
        );
    };

    const renderSignalBars = () => {
        const bars = [];
        const activeColor = networkStatus.online ? '#2c3e50' : '#95a5a6';

        for (let i = 0; i < 4; i++) {
            bars.push(
                <div
                    key={i}
                    className="signal-bar"
                    style={{
                        backgroundColor: i < networkStatus.strength ? activeColor : '#e0e0e0',
                        height: `${(i + 1) * 3}px`,
                        width: '2px',
                        marginRight: '1px'
                    }}
                />
            );
        }

        return <div className="signal-bars">{bars}</div>;
    };

    if (isLoading) return <LoadingScreen />;

    return (
        <div className="profile-container">
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

            <div className="profile-header">
                <div className="user-info">
                    <div className="avatar">
                        <img src="/icons/image@2x.svg" alt="Profile" />
                    </div>
                    <div className="user-details">
                        <h1>{username}</h1>
                    </div>
                </div>
            </div>

            <div className="total-amount-card">
                <div className="amount-header">
                    <h2>Umumiy nasiya</h2>
                    <button className="toggle-visibility" onClick={() => setIsAmountVisible(!isAmountVisible)}>
                        {isAmountVisible ? <IoEyeOutline /> : <IoEyeOffOutline />}
                    </button>
                </div>
                <div className="amount-value">
                    {isAmountVisible ? (
                        <span className="amount">{formatCurrency(profileData.totalDebt)} so'm</span>
                    ) : (
                        <span className="hidden-amount">••••••••</span>
                    )}
                </div>
            </div>

            <div className="stats-grid">
                <div className="stat-card delayed-payments">
                    <div className="stat-icon"><IoWalletOutline /></div>
                    <div className="stat-info">
                        <h3>Kechiktirilgan to'lovlar</h3>
                        <p>{profileData.delayedPayments}</p>
                    </div>
                </div>

                <div className="stat-card total-clients">
                    <div className="stat-icon"><IoPersonOutline /></div>
                    <div className="stat-info">
                        <h3>Mijozlar soni</h3>
                        <p>{profileData.totalClients}</p>
                    </div>
                </div>
            </div>

            <div className="balance-card">
                <div className="balance-icon">
                    <img src="/images/Wallet icon.png" alt="Wallet" />
                </div>
                <div className="balance-info">
                    <span className="label">Hisobingizda</span>
                    <span className="amount">{formatCurrency(profileData.accountBalance)} so'm</span>
                </div>
                <button className="add-funds">+</button>
                <div className="payment-status">
                    <span className="label">Bu oy uchun to'lov:</span>
                    <span className="status">{profileData.monthlyPaymentStatus}</span>
                </div>
            </div>

            <nav className="navigation-menu">
                <button className="nav-item active">
                    <img src="/images/home.png" alt="Home" />
                    <span>Asosiy</span>
                </button>

                <button className="nav-item" onClick={() => navigate("/products")}>
                    <img src="/images/user.png" alt="Clients" />
                    <span>Mijozlar</span>
                </button>

                <button className="nav-item">
                    <img src="/images/Folder.png" alt="Reports" />
                    <span>Hisobot</span>
                </button>

                <button className="nav-item" onClick={() => navigate("/settings")}>
                    <img src="/images/Settings.png" alt="Settings" />
                    <span>Sozlama</span>
                </button>
            </nav>
        </div>
    );
};

export default Profile;
