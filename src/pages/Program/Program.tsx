import { useNavigate } from 'react-router-dom';
import { IoArrowBack } from 'react-icons/io5';
import './Program.scss';

const Program = () => {
    const navigate = useNavigate();
    const version = '1.0.0';

    return (
        <div className="program-container">
            <div className="header">
                <button className="back-button" onClick={() => navigate(-1)} title="Orqaga">
                    <IoArrowBack />
                </button>
                <h1>Dastur haqida</h1>
            </div>

            <div className="content-wrapper">
                <div className="program-content">
                    <div className="logo-section">
                        <img 
                            src="/icons/n.svg" 
                            alt="Logo" 
                            className="app-logo"
                        />
                    </div>

                    <div className="version-info">
                        <div className="version-row">
                            <span className="label">Dastur versiyasi</span>
                            <span className="value">Yangilash</span>
                        </div>
                    </div>

                    <button className="rate-button">
                        Dasturni baholang
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Program; 