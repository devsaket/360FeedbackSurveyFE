import React from 'react';

export const SurveyTraitsData = ({ surveyDetails, traitData }) => {
    // Extract the trait IDs from the surveyDetails object
    const traitIds = surveyDetails[0]?.traits || [];

    // Filter traitData to include only the traits that are in the traitIds list
    const filteredTraits = traitData.filter(trait => traitIds.includes(trait._id));

    return (
        <div>
            <h1>Traits for Survey: {surveyDetails[0]?.surveyName}</h1>
            <ul>
                {filteredTraits.map(trait => (
                    <li key={trait._id}>
                        <h2>{trait.traitName}</h2>
                        <p>{trait.traitDescription}</p>
                    </li>
                ))}
            </ul>
        </div>
    );
};