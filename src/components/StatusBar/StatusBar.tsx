import { useState, useEffect } from 'react';
import { IoWifi, IoWifiOutline, IoBatteryFull, IoBatteryHalf, IoBatteryDead } from 'react-icons/io5';
import { IoPhonePortraitOutline } from 'react-icons/io5';
import './StatusBar.scss';

const StatusBar = () => {
    const [currentTime, setCurrentTime] = useState("");
    const [batteryLevel, setBatteryLevel] = useState<number>(100);
    const [isCharging, setIsCharging] = useState<boolean>(false);
    const [networkStrength, setNetworkStrength] = useState<number>(4);
    const [wifiStrength, setWifiStrength] = useState<number>(3);

    useEffect(() => {
        const updateTime = () => {
            const now = new Date();
            const hours = now.getHours().toString().padStart(2, "0");
            const minutes = now.getMinutes().toString().padStart(2, "0");
            setCurrentTime(`${hours}:${minutes}`);
        };

        const updateBattery = () => {
            if ('getBattery' in navigator) {
                (navigator as any).getBattery().then((battery: any) => {
                    setBatteryLevel(Math.floor(battery.level * 100));
                    setIsCharging(battery.charging);

                    battery.addEventListener('levelchange', () => {
                        setBatteryLevel(Math.floor(battery.level * 100));
                    });
                    battery.addEventListener('chargingchange', () => {
                        setIsCharging(battery.charging);
                    });
                });
            }
        };

        const updateNetworkInfo = () => {
            if ('connection' in navigator) {
                const connection = (navigator as any).connection;
                
                if (connection.type === 'wifi') {
                    setWifiStrength(Math.floor(Math.random() * 4));
                }

                if ('signalStrength' in connection) {
                    setNetworkStrength(Math.floor(connection.signalStrength / 20));
                } else {
                    setNetworkStrength(Math.floor(Math.random() * 5));
                }

                connection.addEventListener('change', updateNetworkInfo);
            }
        };

        updateTime();
        updateBattery();
        updateNetworkInfo();

        const timeInterval = setInterval(updateTime, 60000);
        const networkInterval = setInterval(updateNetworkInfo, 10000);

        return () => {
            clearInterval(timeInterval);
            clearInterval(networkInterval);
        };
    }, []);

    const getBatteryIcon = () => {
        if (batteryLevel > 70) return <IoBatteryFull className={`battery-icon ${isCharging ? 'charging' : ''}`} />;
        if (batteryLevel > 30) return <IoBatteryHalf className={`battery-icon ${isCharging ? 'charging' : ''}`} />;
        return <IoBatteryDead className={`battery-icon ${isCharging ? 'charging' : ''}`} />;
    };

    const getSignalBars = () => {
        const bars = [];
        for (let i = 0; i < 4; i++) {
            bars.push(
                <div 
                    key={i} 
                    className={`signal-bar ${i < networkStrength ? 'active' : ''}`}
                />
            );
        }
        return <div className="signal-bars">{bars}</div>;
    };

    const getWifiIcon = () => {
        if (wifiStrength === 0) return <IoWifiOutline className="wifi-icon weak" />;
        return <IoWifi className={`wifi-icon strength-${wifiStrength}`} />;
    };

    return (
        <div className="status-bar">
            <span className="time">{currentTime}</span>
            <div className="status-icons">
                <div className="network-status">
                    <IoPhonePortraitOutline className="phone-icon" />
                    {getSignalBars()}
                </div>
                {getWifiIcon()}
                <div className="battery-status">
                    {getBatteryIcon()}
                    <span className="battery-level">{batteryLevel}%</span>
                </div>
            </div>
        </div>
    );
};

export default StatusBar; 