import React, { useState } from 'react';
import './LikertScale.css';
import { Button } from 'reactstrap';

const LikertScale = ({ questionId, onResponseChange }) => {
    const [selectedRating, setSelectedRating] = useState(null);
    const [unableToRate, setUnableToRate] = useState(false);

    const handleRatingSelect = (rating) => {
        if (!unableToRate) {
            setSelectedRating(rating);
            onResponseChange(questionId, rating);
        }
    };

    const handleCheckboxChange = () => {
        setUnableToRate(!unableToRate);
        if (!unableToRate) {
            setSelectedRating(null);
            onResponseChange(questionId, 0);
        }
    };


    return (
        <div className="likert-scale">
            {/* <p className='ps-2 fw-bold'>Your Rating</p> */}
            <p className='ps-2 fw-bold'>تقييمك</p>
            <div className='d-flex justify-content-around'>
                <div className="likert-buttons">
                    {Array.isArray([1, 2, 3, 4, 5, 6, 7])&&[1, 2, 3, 4, 5, 6, 7].map((rating) => (
                        <Button key={rating} className={`likert-button ${selectedRating === rating ? 'selected' : ''} `} onClick={() => handleRatingSelect(rating)} disabled={unableToRate}>
                            {rating}
                            <span className="likert-label">
                                {rating === 1 ? 'Very Poor' :
                                    rating === 2 ? 'Poor' :
                                        rating === 3 ? 'Fair' :
                                            rating === 4 ? 'Average' :
                                                rating === 5 ? 'Good' :
                                                    rating === 6 ? 'Very Good' :
                                                        'Excellent'}
                            </span>
                        </Button>
                    ))}
                </div>
            </div>
            {/* <p className='ps-5'>You selected: {selectedRating}</p> */}
            <p className='ps-5'>اختيارك: {selectedRating}</p>
            <div className="unable-to-rate text-right">
                <input type="checkbox" checked={unableToRate} onChange={handleCheckboxChange} className='form-check-input' />
                {/* <label className='form-check-label'>Unable to Rate</label> */}
                <label className='form-check-label'>غير قادر على التقييم</label>
            </div>
        </div>
    );
};

export default LikertScale;
