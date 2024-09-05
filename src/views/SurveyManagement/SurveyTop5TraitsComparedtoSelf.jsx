import React from 'react'
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import SimpleDonutChart from './Charts/SimpleDonutChart';

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
        const filteredTraits = sortedTraits.filter(trait => trait.difference > 0);

        return filteredTraits.slice(0, 5);
    };

    const topTraits = getTopTraits();

    return (
        <>
            <h4>Hidden Traits with Developmental Needs</h4>
            {/* <ul>
                {topTraits.map((trait, idx) => (
                    <li key={idx}>
                        <strong>{trait.trait}</strong> - Self Rating: {trait.selfRating.toFixed(1)}, Average Other Rating: {trait.averageOtherRating.toFixed(1)}, Difference: {trait.difference.toFixed(1)}
                    </li>
                ))}
            </ul> */}

            <table className='table table-bordered'>
                <thead className='thead-white'>
                    <tr>
                        <th className='text-wrap align-top text-start w-25'><b className='text-muted'>Areas</b></th>
                        <th className='text-wrap align-top text-center'><b className='text-muted'>Your Rating</b></th>
                        <th className='text-wrap align-top text-center'><b className='text-muted'>Others Rating</b></th>
                    </tr>
                </thead>
                <tbody>
                    {Array.isArray(topTraits) && topTraits.map((item, index) => (
                        <tr key={index}>
                            <td className='align-middle'>
                                <h3>{item.trait}</h3>
                                {/* <p>This section will be used to rate the employee based on their {item.trait}</p> */}
                            </td>
                            <td><SimpleDonutChart key={index} data={item.selfRating} trait={item.trait} /></td>
                            <td><SimpleDonutChart key={index} data={item.averageOtherRating} trait={item.trait} /></td>
                        </tr>
                    ))}
                </tbody>
            </table>


            {/* <ResponsiveContainer width="100%" height={400}>
                <BarChart data={topTraits}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="trait" />
                    <YAxis type="number" domain={[0, 7]} tickCount={8} />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="selfRating" fill="#8884d8" name="Self Rating" />
                    <Bar dataKey="averageOtherRating" fill="#82ca9d" name="Average Other Rating" />
                </BarChart>
            </ResponsiveContainer> */}
        </>
    )
}

export default SurveyTop5TraitsComparedToSelf
