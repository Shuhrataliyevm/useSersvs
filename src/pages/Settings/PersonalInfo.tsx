import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { IoArrowBack, IoPencil, IoCheckmark, IoClose } from 'react-icons/io5';
import { toast } from 'react-toastify';
import './Settings.scss';

interface UserProfile {
    full_name: string;
    phone_number: string;
    email: string;
    avatar?: string;
}

const PersonalInfo: React.FC = () => {
    const navigate = useNavigate();
    const [profile, setProfile] = useState<UserProfile>({
        full_name: '',
        phone_number: '',
        email: '',
    });
    const [editedProfile, setEditedProfile] = useState<UserProfile>({
        full_name: '',
        phone_number: '',
        email: '',
    });
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [selectedImage, setSelectedImage] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string>('');

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch('https://nasiya.takedaservice.uz/api/profile', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            
            if (!response.ok) {
                throw new Error('Профиль юкланмади');
            }
            
            const data = await response.json();
            setProfile(data.data);
            setEditedProfile(data.data);
        } catch (error) {
            console.error('Error fetching profile:', error);
            toast.error('Профиль юклашда хатолик юз берди');
        } finally {
            setLoading(false);
        }
    };

    const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) {
                toast.error('Расм хажми 5МБ дан ошмаслиги керак');
                return;
            }
            setSelectedImage(file);
            setPreviewUrl(URL.createObjectURL(file));
        }
    };

    const uploadImage = async () => {
        if (!selectedImage) return;

        try {
            const formData = new FormData();
            formData.append('avatar', selectedImage);

            const token = localStorage.getItem('token');
            const response = await fetch('https://nasiya.takedaservice.uz/api/profile/avatar', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: formData
            });

            if (!response.ok) {
                throw new Error('Расм юклашда хатолик');
            }

            const data = await response.json();
            setProfile(prev => ({ ...prev, avatar: data.data.avatar }));
            toast.success('Расм муваффақиятли юкланди');
        } catch (error) {
            console.error('Error uploading image:', error);
            toast.error('Расм юклашда хатолик юз берди');
        }
    };

    const handleSave = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch('https://nasiya.takedaservice.uz/api/profile', {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(editedProfile)
            });

            if (!response.ok) {
                throw new Error('Маълумотларни сақлашда хатолик');
            }

            if (selectedImage) {
                await uploadImage();
            }

            setProfile(editedProfile);
            setIsEditing(false);
            toast.success('Маълумотлар муваффақиятли сақланди');
        } catch (error) {
            console.error('Error saving profile:', error);
            toast.error('Маълумотларни сақлашда хатолик юз берди');
        }
    };

    const handleCancel = () => {
        setEditedProfile(profile);
        setSelectedImage(null);
        setPreviewUrl('');
        setIsEditing(false);
    };

    if (loading) {
        return (
            <div className="settings-loading">
                <div className="loading-spinner"></div>
            </div>
        );
    }

    return (
        <div className="personal-info-container">
            <div className="header">
                <button 
                    onClick={() => navigate('/settings')} 
                    className="back-button"
                    aria-label="Orqaga"
                >
                    <IoArrowBack />
                </button>
                <h1>Shaxsiy ma'lumotlar</h1>
                {!isEditing ? (
                    <button 
                        className="edit-button"
                        onClick={() => setIsEditing(true)}
                        aria-label="Tahrirlash"
                    >
                        <IoPencil />
                    </button>
                ) : (
                    <div className="action-buttons">
                        <button 
                            className="cancel-button"
                            onClick={handleCancel}
                            aria-label="Bekor qilish"
                        >
                            <IoClose />
                        </button>
                        <button 
                            className="save-button"
                            onClick={handleSave}
                            aria-label="Saqlash"
                        >
                            <IoCheckmark />
                        </button>
                    </div>
                )}
            </div>

            <div className="profile-section">
                <div className="avatar-section">
                    <div className="avatar-container">
                        {(previewUrl || profile.avatar) ? (
                            <img 
                                src={previewUrl || profile.avatar} 
                                alt={profile.full_name} 
                                className="avatar"
                            />
                        ) : (
                            <div className="avatar-placeholder">
                                <svg width="117" height="117" viewBox="0 0 100 100" fill="none">
                                    <circle cx="50" cy="50" r="50" fill="#E9E9E9"/>
                                    <path d="M50 48C55.5228 48 60 43.5228 60 38C60 32.4772 55.5228 28 50 28C44.4772 28 40 32.4772 40 38C40 43.5228 44.4772 48 50 48Z" fill="#A1A1A1"/>
                                    <path d="M70 68C70 63.5817 68.3679 59.3454 65.4926 56.2426C62.6174 53.1397 58.6522 51.3333 54.5 51.3333H45.5C41.3478 51.3333 37.3826 53.1397 34.5074 56.2426C31.6321 59.3454 30 63.5817 30 68" fill="#A1A1A1"/>
                                </svg>
                            </div>
                        )}
                        {isEditing && (
                            <label className="edit-avatar" aria-label="Rasmni tahrirlash">
                                <IoPencil />
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleImageChange}
                                    style={{ display: 'none' }}
                                />
                            </label>
                        )}
                    </div>
                </div>

                <div className="info-fields">
                    <div className="info-group">
                        <label>Ismi familiya</label>
                        {isEditing ? (
                            <input
                                type="text"
                                className="info-input"
                                value={editedProfile.full_name}
                                onChange={(e) => setEditedProfile(prev => ({
                                    ...prev,
                                    full_name: e.target.value
                                }))}
                                placeholder="Исмингизни киритинг"
                            />
                        ) : (
                            <div className="info-value">
                                {profile.full_name}
                            </div>
                        )}
                    </div>

                    <div className="info-group">
                        <label>Telefon raqam</label>
                        {isEditing ? (
                            <input
                                type="tel"
                                className="info-input"
                                value={editedProfile.phone_number}
                                onChange={(e) => setEditedProfile(prev => ({
                                    ...prev,
                                    phone_number: e.target.value
                                }))}
                                placeholder="+998 XX XXX XX XX"
                            />
                        ) : (
                            <div className="info-value">
                                {profile.phone_number}
                            </div>
                        )}
                    </div>

                    <div className="info-group">
                        <label>Elektron pochta</label>
                        {isEditing ? (
                            <input
                                type="email"
                                className="info-input"
                                value={editedProfile.email}
                                onChange={(e) => setEditedProfile(prev => ({
                                    ...prev,
                                    email: e.target.value
                                }))}
                                placeholder="email@example.com"
                            />
                        ) : (
                            <div className="info-value">
                                {profile.email}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PersonalInfo; 