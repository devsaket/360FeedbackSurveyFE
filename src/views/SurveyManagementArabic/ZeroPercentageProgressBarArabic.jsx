import React from 'react';
import '../../assets/css/ZeroPercentageProgressBar.css'; // Import CSS file for styling

const ZeroPercentageProgressBarArabic = ({ zeroPercentage }) => {
    // Calculate the width of red and green segments
    const redWidth = `${zeroPercentage}%`;
    const greenWidth = `${100 - zeroPercentage}%`;

    return (
        <div className="d-flex flex-row my-3 zero-percent-progress-bar">
            <div className="text-center bg-danger align-middle zero-percent-progress-bar-segment" style={{ width: redWidth }}>
                <span className='font-weight-bold zero-percent-progress-bar-label'>{zeroPercentage}%</span>
            </div>
            <div className="text-center bg-success align-middle zero-percent-progress-bar-segment" style={{ width: greenWidth }}>
                <span className='font-weight-bold zero-percent-progress-bar-label'>{100 - zeroPercentage}%</span>
            </div>
        </div>
    );
};

export default ZeroPercentageProgressBarArabic;