import React from 'react';
import '../../assets/css/ZeroPercentageProgressBar.css'; // Import CSS file for styling

const ZeroPercentageProgressBar = ({ zeroPercentage }) => {
    // Calculate the width of red and green segments
    const redWidth = `${zeroPercentage}%`;
    const greenWidth = `${100 - zeroPercentage}%`;

    return (
        <div className="d-flex flex-row my-3 progress-bar">
            <div className="progress-bar-segment red" style={{ width: redWidth }}>
                <span>{zeroPercentage}%</span>
            </div>
            <div className="progress-bar-segment green" style={{ width: greenWidth }}>
                <span>{100 - zeroPercentage}%</span>
            </div>
        </div>
    );
};

export default ZeroPercentageProgressBar;