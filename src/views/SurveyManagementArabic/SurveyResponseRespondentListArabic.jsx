import React from 'react';
import ZeroPercentageProgressBar from './ZeroPercentageProgressBarArabic';

const SurveyResponseRespondentListArabic = ({ surveyResponses }) => {

    // console.log("Subject Response = ", surveyResponses);

    const zeroFilledSubject = surveyResponses.map(subject=> {
        const totalResponses = subject.responses.length;
        const zeroResponses = subject.responses.filter(r => r.answer === '0').length;
        const zeroPercentage = (zeroResponses / totalResponses) * 100;

        return {name: subject.subjectName, zeroPercentage: zeroPercentage.toFixed(1)}
    })

    // Filter the respondents who have filled the survey
    const filledRespondents = surveyResponses
        .filter(response => response.isFilled)
        .map(response => response.respondent)
        .flat(); // Flatten the nested array

    // Calculate the zero response percentage for each respondent
    const respondentsWithZeroPercent = filledRespondents.map((respondent, index) => {
        const totalResponses = respondent.responses.length;
        const zeroResponses = respondent.responses;
        // .filter(r => r.answer === '0').length;
        const zeroPercentage = (zeroResponses / totalResponses) * 100;

        return {
            // name: respondent.respondentName,
            name: "Respondent " + index,
            zeroPercentage: zeroPercentage.toFixed(1) // Fixed to 2 decimal places
        };
    }); 

    console.log("Respondents Data Zero Percent = ", respondentsWithZeroPercent);

    return (
        <div>
            <h1>Percentage of ‘Unable to Rate’ by the Multi-Raters and Self</h1>
            <ol>
                {zeroFilledSubject.map(({ name, zeroPercentage }) => (
                    <li key={name}>
                        <p><strong>{name}</strong>: {zeroPercentage}% of responses are <i>'Unable to Rate'</i></p>
                        <ZeroPercentageProgressBar zeroPercentage={parseFloat(zeroPercentage)} />
                    </li>
                ))}
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

export default SurveyResponseRespondentListArabic;
