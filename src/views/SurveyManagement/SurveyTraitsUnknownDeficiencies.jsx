import React from 'react'
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';

const SurveyTraitsUnknownDeficiencies = ({ traitSelfOthersData }) => {
    const getUnknownDeficiency = () => {
        const traitsWithComparison = traitSelfOthersData.map(item => {
            return {
                trait: item.trait,
                selfRating: parseFloat(item.selfRating).toFixed(1),
                averageOtherRating: parseFloat(item.averageOtherRating).toFixed(1),
                difference: (parseFloat(item.selfRating) - parseFloat(item.averageOtherRating)).toFixed(1)
            };
        });

        const unknownDeficiencyTraits = traitsWithComparison.filter(item => { return item.difference >= 1 });
        return unknownDeficiencyTraits;
    };

    const unknownDeficiencyTraits = getUnknownDeficiency();

    return (
        <>
            <h4>Traits denoting your Unknown Deficiency</h4>
            {unknownDeficiencyTraits.length > 0 ?
                <>
                    <ul>
                        {unknownDeficiencyTraits.map((trait, idx) => (
                            <li key={idx}>
                                <strong>{trait.trait}</strong> - Self Rating: {trait.selfRating}, Average Other Rating: {trait.averageOtherRating}, Difference: {trait.difference}
                            </li>
                        ))}
                    </ul>
                    <ResponsiveContainer width="100%" height={400}>
                        <BarChart data={unknownDeficiencyTraits}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="trait" />
                            <YAxis domain={[0,7]} />
                            <Tooltip />
                            <Legend />
                            <Bar dataKey="selfRating" fill="#8884d8" name="Self Rating" />
                            <Bar dataKey="averageOtherRating" fill="#82ca9d" name="Average Other Rating" />
                        </BarChart>
                    </ResponsiveContainer>
                </> : <>
                    <p className='ml-4'>No such Traits are Found</p>
                </>
            }

        </>
    )
}

export default SurveyTraitsUnknownDeficiencies
