import React from 'react'
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import SimpleDonutChart from './Charts/SimpleDonutChart';

const SurveyTraitsHighPotential = ({ traitSelfOthersData }) => {
    const getHighPotential = () => {
        const traitsWithComparison = traitSelfOthersData.map(item => {
            return {
                trait: item.trait,
                selfRating: parseFloat(item.selfRating).toFixed(1),
                averageOtherRating: parseFloat(item.averageOtherRating).toFixed(1),
                difference: (parseFloat(item.averageOtherRating) - parseFloat(item.selfRating)).toFixed(1)
            };
        });

        const highPotentialTraits = traitsWithComparison.filter(item => { return item.selfRating > 4 && item.selfRating < 5 && item.averageOtherRating > 4 && item.averageOtherRating < 5 });
        return highPotentialTraits;
    };

    const highPotentialTraits = getHighPotential();

    return (
        <>
            {/* <h4>High Potential Traits</h4> */}
            <h4>Traits of Potential Strengths</h4>
            {highPotentialTraits.length > 0 ? <>
                {/* <ul>
                    {highPotentialTraits.map((trait, idx) => (
                        <li key={idx}>
                            <strong>{trait.trait}</strong> - Self Rating: {trait.selfRating}, Average Other Rating: {trait.averageOtherRating}, Difference: {trait.difference}
                        </li>
                    ))}
                </ul> */}

                <table className='table table-bordered'>
                                    <thead className='thead-white'>
                                        <tr>
                                            <th className='text-wrap align-top text-start w-50'><b className='text-muted'>Areas</b></th>
                                            <th className='text-wrap align-top text-center w-25'><b className='text-muted'>Your Rating</b></th>
                                            <th className='text-wrap align-top text-center w-25'><b className='text-muted'>Others Rating</b></th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {Array.isArray(highPotentialTraits) && highPotentialTraits.map((item, index) => (
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
                        <BarChart data={highPotentialTraits}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="trait" />
                            <YAxis domain={[0,7]}/>
                            <Tooltip />
                            <Legend />
                            <Bar dataKey="selfRating" fill="#8884d8" name="Self Rating" />
                            <Bar dataKey="averageOtherRating" fill="#82ca9d" name="Average Other Rating" />
                        </BarChart>
                    </ResponsiveContainer> */}
            </> : <>
                <p className='ml-4'>No such Traits are Found</p>
            </>}
        </>
    )
}

export default SurveyTraitsHighPotential
