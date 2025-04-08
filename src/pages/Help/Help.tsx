import { IoArrowBack } from 'react-icons/io5';
import { FaInstagram } from 'react-icons/fa';
import { FaTelegram } from 'react-icons/fa';
import { FaPhone } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import './Help.scss';

const Help = () => {
    const navigate = useNavigate();

    return (
        <div className="help-container">
            <div className="header">
                <button className="back-button" onClick={() => navigate(-1)} title="Orqaga">
                    <IoArrowBack />
                </button>
                <h1>Yordam</h1>
            </div>

            <div className="help-content">
                <h2>Biz doim siz bilan aloqadamiz</h2>
                <p>Har qanday savollarga javob beramiz, buyurtma bilan yordam beramiz, istaklarni tinglaymiz</p>

                <div className="contact-buttons">
                    <a href="https://instagram.com/your_account" className="contact-button instagram">
                        <FaInstagram className="icon" />
                        <span>Instagram</span>
                    </a>

                    <a href="https://t.me/your_account" className="contact-button telegram">
                        <FaTelegram className="icon" />
                        <span>Telegram</span>
                    </a>

                    <a href="tel:+998000000000" className="contact-button phone">
                        <FaPhone className="icon" />
                        <span>Aloqa uchun</span>
                    </a>
                </div>
            </div>
        </div>
    );
};

export default Help; 