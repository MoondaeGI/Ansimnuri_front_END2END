import {Marker as M} from 'react-map-gl/mapbox';
import './css/Marker.css';

export const Marker = ({children, latitude, longitude, color = '#FF5252', ...props}) => {
    return (
        <M latitude={latitude} longitude={longitude} color={color} {...props}>
            <div className="map-marker">
                <div className="pin" style={{ backgroundColor: color }}>
                    <div className="pin-circle"></div>
                </div>
                <div className="pin-effect"></div>
            </div>
        </M>
    );
}