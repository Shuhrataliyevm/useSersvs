import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { IoArrowBack, IoImage, IoTrash } from 'react-icons/io5';
import { toast } from 'react-toastify';
import './CreateDebtor.scss';

interface FormErrors {
    full_name?: string;
    address?: string;
    phone_numbers?: string;
    images?: string;
}

const CreateDebtor: React.FC = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        full_name: '',
        address: '',
        phone_numbers: [''],
        images: [] as File[]
    });
    const [errors, setErrors] = useState<FormErrors>({});

    const phoneRegex = /^\+998[0-9]{9}$/;

    const validateForm = () => {
        const newErrors: FormErrors = {};

        if (!formData.full_name.trim()) {
            newErrors.full_name = 'ФИО не может быть пустым';
        }

        if (!formData.address.trim()) {
            newErrors.address = 'Адрес не может быть пустым';
        }

        const validPhoneNumbers = formData.phone_numbers.filter(phone => phone.trim());
        if (validPhoneNumbers.length === 0 || validPhoneNumbers.length > 3) {
            newErrors.phone_numbers = 'Требуется от 1 до 3 номеров телефона';
        } else {
            const invalidNumbers = validPhoneNumbers.filter(phone => !phoneRegex.test(phone));
            if (invalidNumbers.length > 0) {
                newErrors.phone_numbers = 'Неверный формат номера телефона (должен быть +998XXXXXXXXX)';
            }
        }

        if (formData.images.length !== 2) {
            newErrors.images = 'Требуется загрузить ровно 2 изображения';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        const submitData = new FormData();
        submitData.append('full_name', formData.full_name.trim());
        submitData.append('address', formData.address.trim());
        formData.phone_numbers.forEach(phone => {
            if (phone.trim()) {
                submitData.append('phone_numbers[]', phone.trim());
            }
        });
        formData.images.forEach(image => {
            submitData.append('images', image);
        });

        try {
            const response = await fetch('/api/debtors', {
                method: 'POST',
                body: submitData
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Ошибка при создании должника');
            }

            toast.success('Должник успешно создан');
            navigate('/');
        } catch (error) {
            toast.error(error instanceof Error ? error.message : 'Произошла ошибка');
        }
    };

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        if (files.length + formData.images.length > 2) {
            toast.error('Можно загрузить максимум 2 изображения');
            return;
        }
        setFormData(prev => ({
            ...prev,
            images: [...prev.images, ...files].slice(0, 2)
        }));
        setErrors(prev => ({ ...prev, images: undefined }));
    };

    const handleDeleteImage = (index: number) => {
        setFormData(prev => ({
            ...prev,
            images: prev.images.filter((_, i) => i !== index)
        }));
    };

    const handlePhoneChange = (index: number, value: string) => {
        setFormData(prev => ({
            ...prev,
            phone_numbers: prev.phone_numbers.map((phone, i) =>
                i === index ? value : phone
            )
        }));
        setErrors(prev => ({ ...prev, phone_numbers: undefined }));
    };

    const addPhoneField = () => {
        if (formData.phone_numbers.length < 3) {
            setFormData(prev => ({
                ...prev,
                phone_numbers: [...prev.phone_numbers, '']
            }));
        }
    };

    const removePhoneField = (index: number) => {
        if (formData.phone_numbers.length > 1) {
            setFormData(prev => ({
                ...prev,
                phone_numbers: prev.phone_numbers.filter((_, i) => i !== index)
            }));
        }
    };

    return (
        <div className="create-debtor">
            <div className="header">
                <button onClick={() => navigate(-1)} className="back-button">
                    <IoArrowBack /> chiqish
                </button>
                <h1>Создать должника</h1>
            </div>

            <form onSubmit={handleSubmit} className="debtor-form">
                <div className="form-group">
                    <label htmlFor="full_name">Ismi</label>
                    <input
                        id="full_name"
                        type="text"
                        value={formData.full_name}
                        onChange={e => {
                            setFormData(prev => ({ ...prev, full_name: e.target.value }));
                            setErrors(prev => ({ ...prev, full_name: undefined }));
                        }}
                        className={errors.full_name ? 'error' : ''}
                        placeholder="Введите ФИО"
                    />
                    {errors.full_name && <span className="error-message">{errors.full_name}</span>}
                </div>

                <div className="form-group">
                    <label htmlFor="address">Yashash manzili</label>
                    <input
                        id="address"
                        type="text"
                        value={formData.address}
                        onChange={e => {
                            setFormData(prev => ({ ...prev, address: e.target.value }));
                            setErrors(prev => ({ ...prev, address: undefined }));
                        }}
                        className={errors.address ? 'error' : ''}
                        placeholder="Введите адрес"
                    />
                    {errors.address && <span className="error-message">{errors.address}</span>}
                </div>

                <div className="form-group">
                    <label>Telefon raqami </label>
                    {formData.phone_numbers.map((phone, index) => (
                        <div key={index} className="phone-input">
                            <input
                                type="text"
                                value={phone}
                                onChange={e => handlePhoneChange(index, e.target.value)}
                                className={errors.phone_numbers ? 'error' : ''}
                                placeholder="+998XXXXXXXXX"
                            />
                            {formData.phone_numbers.length > 1 && (
                                <button
                                    type="button"
                                    onClick={() => removePhoneField(index)}
                                    className="remove-phone"
                                >
                                    <IoTrash />
                                </button>
                            )}
                        </div>
                    ))}
                    {formData.phone_numbers.length < 3 && (
                        <button type="button" onClick={addPhoneField} className="add-phone">
                            Telefon raqami
                        </button>
                    )}
                    {errors.phone_numbers && (
                        <span className="error-message">{errors.phone_numbers}</span>
                    )}
                </div>

                <div style={{'position':'relative',left:'100px'}} className="form-group">
                    <label>Rasim</label>
                    <div className="images-container">
                        {formData.images.map((image, index) => (
                            <div key={index} className="image-preview">
                                <img src={URL.createObjectURL(image)} alt={`Preview ${index + 1}`} />
                                <button
                                    type="button"
                                    onClick={() => handleDeleteImage(index)}
                                    className="delete-image"
                                >
                                    <IoTrash />
                                </button>
                            </div>
                        ))}
                        {formData.images.length < 2 && (
                            <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }} className="upload-button">
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleImageUpload}
                                    style={{ display: 'none', alignItems: 'center' }}
                                />
                                <IoImage /> Rasm qo‘shish
                            </label>
                        )}
                    </div>
                    {errors.images && <span className="error-message">{errors.images}</span>}
                </div>

                <button type="submit" className="submit-button">
                    Saqlash
                </button>
            </form>
        </div>
    );
};

export default CreateDebtor;
