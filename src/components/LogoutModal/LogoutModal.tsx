import React from 'react';
import './LogoutModal.scss';

interface LogoutModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
}

const LogoutModal: React.FC<LogoutModalProps> = ({ isOpen, onClose, onConfirm }) => {
    if (!isOpen) return null;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
                <div className="modal-icon">
                    <img src="/icons/layout-image.svg" alt="Logout" />
                </div>
                <h2>Hisobdan chiqish</h2>
                <p>Siz haqiqatan hisobdan chiqmoqchimisiz?</p>
                <div className="modal-buttons">
                    <button className="confirm-button" onClick={onConfirm}>
                        Ha, chiqish
                    </button>
                    <button className="cancel-button" onClick={onClose}>
                        Bekor qilish
                    </button>
                </div>
            </div>
        </div>
    );
};

export default LogoutModal; 