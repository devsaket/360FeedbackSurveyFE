import React from 'react'
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import SimpleDonutChart from './Charts/SimpleDonutChart';

const SurveyTraitsUnknownDeficiencies = ({ traitSelfOthersData }) => {
    const getUnknownDeficiency = () => {
        const traitsWithComparison = traitSelfOthersData.map(item => {
            return {
                trait: item.trait,
                selfRating: parseFloat(item.selfRating).toFixed(1),
                averageOtherRating: parseFloat(item.averageOtherRating).toFixed(1),
                difference: (parseFloat(item.averageOtherRating) - parseFloat(item.selfRating)).toFixed(1)
            };
        });

        const unknownDeficiencyTraits = traitsWithComparison.filter(item => { return item.difference > 0 });
        return unknownDeficiencyTraits;
    };

    const unknownDeficiencyTraits = getUnknownDeficiency();

    return (
        <>
            {/* <h4>Traits denoting your Unknown Deficiency</h4> */}
            <h4>Blind Traits with Developmental Needs</h4>
            {unknownDeficiencyTraits.length > 0 ?
                <>
                    {/* <ul>
                        {unknownDeficiencyTraits.map((trait, idx) => (
                            <li key={idx}>
                                <strong>{trait.trait}</strong> - Self Rating: {trait.selfRating}, Average Other Rating: {trait.averageOtherRating}, Difference: {trait.difference}
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
                            {Array.isArray(unknownDeficiencyTraits) && unknownDeficiencyTraits.map((item, index) => (
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
                        <BarChart data={unknownDeficiencyTraits}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="trait" />
                            <YAxis domain={[0,7]} />
                            <Tooltip />
                            <Legend />
                            <Bar dataKey="selfRating" fill="#8884d8" name="Self Rating" />
                            <Bar dataKey="averageOtherRating" fill="#82ca9d" name="Average Other Rating" />
                        </BarChart>
                    </ResponsiveContainer> */}
                </> : <>
                    <p className='ml-4'>No such Traits are Found</p>
                </>
            }

        </>
    )
}

export default SurveyTraitsUnknownDeficiencies
