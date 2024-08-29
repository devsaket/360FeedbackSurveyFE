import React from 'react'
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';

const SurveyTop5TraitsComparedToSelf = ({ traitSelfOthersData }) => {
    const getTopTraits = () => {
        const traitsWithComparison = traitSelfOthersData.map(item => {
            return {
                trait: item.trait,
                selfRating: parseFloat(item.selfRating),
                averageOtherRating: parseFloat(item.averageOtherRating),
                difference: parseFloat(item.selfRating) - parseFloat(item.averageOtherRating)
            };
        });

        const sortedTraits = traitsWithComparison.sort((a, b) => b.difference - a.difference);
        return sortedTraits.slice(0, 5);
    };

    const topTraits = getTopTraits();

    return (
        <>
            <h4>Top 5 Traits Compared to Self</h4>
            <ul>
                {topTraits.map((trait, idx) => (
                    <li key={idx}>
                        <strong>{trait.trait}</strong> - Self Rating: {trait.selfRating.toFixed(1)}, Average Other Rating: {trait.averageOtherRating.toFixed(1)}, Difference: {trait.difference.toFixed(1)}
                    </li>
                ))}
            </ul>
            
            <ResponsiveContainer width="100%" height={400}>
                <BarChart data={topTraits}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="trait" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="selfRating" fill="#8884d8" name="Self Rating" />
                    <Bar dataKey="averageOtherRating" fill="#82ca9d" name="Average Other Rating" />
                </BarChart>
            </ResponsiveContainer>
        </>
    )
}

export default SurveyTop5TraitsComparedToSelf
