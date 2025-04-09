import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { IoArrowBack, IoChevronForward } from 'react-icons/io5';
import LogoutModal from '../../components/LogoutModal/LogoutModal';
import './Settings.scss';


interface SettingsGroup {
    title: string;
    items: {
        id: string;
        title: string;
        link: string;
        color?: string;
    }[];
}

const Settings: React.FC = () => {
    const navigate = useNavigate();
    const [profile, setProfile] = useState({
        full_name: '',
        phone_number: '',
        email: '',
        avatar: ''
    });
    const [loading, setLoading] = useState(true);
    const [showLogoutModal, setShowLogoutModal] = useState(false);

    const settingsGroups: SettingsGroup[] = [
        {
            title: 'Asosiy',
            items: [
                { id: '1', title: "Shaxsiy ma'lumotlar", link: '/personal-info' },
                { id: '2', title: 'Xavfsizlik', link: '/security' }
            ]
        },
        {
            title: 'Boshqa',
            items: [
                { id: '3', title: 'Yordam', link: '/help' },
                { id: '4', title: 'Taklif va shikoyatlar', link: '/version' },
                { id: '5', title: 'Dastur haqida', link: '/program' },
                { id: '6', title: 'Ommaviy oferta', link: '/terms' },
                { id: '7', title: 'Maxfiylik siyosati', link: '/privacy' }
            ]
        },
        {
            title: 'Chiqish',
            items: [
                { id: '8', title: 'Chiqish', link: '/logout', color: '#FF3B30' }
            ]
        }
    ];

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const token = localStorage.getItem('token');
                const response = await fetch('https://nasiya.takedaservice.uz/api/profile', {
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

                const data = await response.json();
                setProfile(data.data);
            } catch (error) {
                console.error('Error fetching profile:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchProfile();
        setTimeout(() => setLoading(false), 1500);
    }, [navigate]);

    const handleLogout = () => {
        setShowLogoutModal(true);
    };

    const confirmLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('starredItems');
        setShowLogoutModal(false);
        navigate('/login', { replace: true });
    };

    const handleItemClick = (link: string) => {
        if (link === '/logout') {
            handleLogout();
            return;
        }
        navigate(link);
    };

    if (loading) {
        return (
            <div className="settings-loading">
                <div className="loading-spinner"></div>
            </div>
        );
    }

    return (
        <div className="settings-container">
            <div className="header">
                <button className="back-button" onClick={() => navigate(-1)} title="Orqaga">
                    <IoArrowBack />
                </button>
                <h1>Созламалар</h1>
            </div>

            <div className="settings-list">
                {settingsGroups.map((group, index) => (
                    <div key={index} className="settings-group">
                        <h2 className="group-title">{group.title}</h2>
                        <div className="settings-items">
                            {group.items.map((item) => (
                                <button
                                    key={item.id}
                                    className="settings-item"
                                    onClick={() => handleItemClick(item.link)}
                                    style={{ color: item.color }}
                                >
                                    <span>{item.title}</span>
                                    <IoChevronForward className="arrow" />
                                </button>
                            ))}
                        </div>
                    </div>
                ))}
            </div>

            <LogoutModal 
                isOpen={showLogoutModal}
                onClose={() => setShowLogoutModal(false)}
                onConfirm={confirmLogout}
            />
        </div>
    );
};

export default Settings; 