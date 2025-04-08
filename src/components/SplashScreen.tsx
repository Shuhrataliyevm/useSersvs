import { useEffect, useState } from 'react';
import './SplashScreen.scss';

const SplashScreen = ({ onFinish }: { onFinish: () => void }) => {
    const [show, setShow] = useState(true);

    useEffect(() => {
        const timer = setTimeout(() => {
            setShow(false);
            setTimeout(onFinish, 500);
        }, 3000); 

        return () => clearTimeout(timer);
    }, [onFinish]);

    if (!show) return null;

    return (
        <div className="splash-screen">
            <div className="splash-content">
                <img 
                    src="/icons/newlogo.svg" 
                    alt="Logo" 
                    className="splash-logo"
                />
                <div className="loading-dots">
                    <div className="dot"></div>
                    <div className="dot"></div>
                    <div className="dot"></div>
                </div>
            </div>
        </div>
    );
};

export default SplashScreen; 