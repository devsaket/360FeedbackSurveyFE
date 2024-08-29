import React from 'react'
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';

const SurveyTraitsOpenDeficiencies = ({ traitSelfOthersData }) => {
    const getOpenDeficiency = () => {
        const openDeficiencyTraits = traitSelfOthersData.filter(item => { return item.selfRating < 4 && item.averageOtherRating < 4 });
        return openDeficiencyTraits;
    };

    const openDeficiencyTraits = getOpenDeficiency();

    return (
        <>
            <h4>Traits denoting your Open Deficiencies</h4>
            {openDeficiencyTraits.length > 0 ?
                <>
                    <ul>
                        {openDeficiencyTraits.map((trait, idx) => (
                            <li key={idx}>
                                <strong>{trait.trait}</strong> - Self Rating: {trait.selfRating}, Average Other Rating: {trait.averageOtherRating}
                            </li>
                        ))}
                    </ul>
                    <ResponsiveContainer width="100%" height={400}>
                        <BarChart data={openDeficiencyTraits}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="trait" />
                            <YAxis domain={[0,7]}/>
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

export default SurveyTraitsOpenDeficiencies
