import React from 'react'
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';

const SurveyTraitsForStrengths = ({ traitSelfOthersData }) => {
    const filterTopTraits = () => {
        return traitSelfOthersData.filter(item => {
            const selfRating = parseFloat(item.selfRating);
            const averageOtherRating = parseFloat(item.averageOtherRating);
            return selfRating >= 5 && averageOtherRating >= 5;
        });
    };

    const topTraitsOfStrength = filterTopTraits();

    return (
        <>
            {/* <h4>Traits denoting your strengths</h4> */}
            <h4>Traits of Strength</h4>
            {topTraitsOfStrength.length > 0 ?
                <>
                    <ul>
                        {topTraitsOfStrength.map((trait, idx) => (
                            <li key={idx}>
                                <strong>{trait.trait}</strong> - Self Rating: {trait.selfRating}, Average Other Rating: {trait.averageOtherRating}
                            </li>
                        ))}
                    </ul>
                    <ResponsiveContainer width="100%" height={400}>
                        <BarChart data={topTraitsOfStrength}>
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

export default SurveyTraitsForStrengths