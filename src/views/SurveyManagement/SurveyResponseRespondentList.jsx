import React from 'react';
import ZeroPercentageProgressBar from './ZeroPercentageProgressBar';

const SurveyResponseRespondentList = ({ surveyResponses }) => {
    // Filter the respondents who have filled the survey
    const filledRespondents = surveyResponses
        .filter(response => response.isFilled)
        .map(response => response.respondent)
        .flat(); // Flatten the nested array

    // Calculate the zero response percentage for each respondent
    const respondentsWithZeroPercent = filledRespondents.map(respondent => {
        const totalResponses = respondent.responses.length;
        const zeroResponses = respondent.responses.filter(r => r.answer === '0').length;
        const zeroPercentage = (zeroResponses / totalResponses) * 100;

        return {
            name: respondent.respondentName,
            zeroPercentage: zeroPercentage.toFixed(1) // Fixed to 2 decimal places
        };
    });

    return (
        <div>
            <h1>Respondents with Zero Response Percentages</h1>
            <ul>
                {respondentsWithZeroPercent.map(({ name, zeroPercentage }) => (
                    <li key={name}>
                        <strong>{name}</strong>: {zeroPercentage}% of responses are zero
                        <ZeroPercentageProgressBar zeroPercentage={parseFloat(zeroPercentage)} />
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default SurveyResponseRespondentList;
