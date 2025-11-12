import React from 'react';
import ZeroPercentageProgressBar from './ZeroPercentageProgressBar';

const SurveyResponseRespondentList = ({ surveyResponses }) => {
    // Filter the respondents who have filled the survey
    const filledRespondents = surveyResponses
        .filter(response => response.isFilled)
        .map(response => response.respondent)
        .flat(); // Flatten the nested array

    // Calculate the zero response percentage for each respondent
    const respondentsWithZeroPercent = filledRespondents.map((respondent, index) => {
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
            <h1>Percentage of ‘Unable to Rate’ by the Multi-Raters and Self</h1>
            <ol>
                {respondentsWithZeroPercent.map(({ name, zeroPercentage }) => (
                    <li key={name}>
                        <p><strong>{name}</strong>: {zeroPercentage}% of responses are <i>'Unable to Rate'</i></p>
                        <ZeroPercentageProgressBar zeroPercentage={parseFloat(zeroPercentage)} />
                    </li>
                ))}
            </ol>
        </div>
    );
};

export default SurveyResponseRespondentList;
