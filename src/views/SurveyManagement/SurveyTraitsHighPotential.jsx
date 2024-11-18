import React, { useEffect, useState } from 'react'
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import SimpleDonutChart from './Charts/SimpleDonutChart';

const SurveyTraitsHighPotential = ({ traitSelfOthersData  , traitCategoryData, traitData, traitQuestionData, surveyCategoryObject, categoriesRolesObject }) => {

    const [processedData, setProcessedData] = useState([]);

    // Map over surveyCategory and add categoryName
    const updatedSurveyCategory = surveyCategoryObject.map((survey, index) => {
        const matchedCategory = categoriesRolesObject.find(category => category._id === survey.category);
        return {
            ...survey,
            categoryName: matchedCategory ? matchedCategory.categoryName : null,
        };
    });

    // Add 'Self' to updatedSurveyCategory
    const categoriesWithSelf = [{ categoryName: 'Self', color: '#0088FE' }, ...updatedSurveyCategory];

    useEffect(() => {
        const calculateAverage = (arr) => arr.reduce((sum, val) => sum + val, 0) / (arr.length || 1);

        // Step 1: Transform traitQuestionData
        const transformedData = Object.keys(traitQuestionData).map(trait => {
            const questions = traitQuestionData[trait];

            // Step 1: Transform traitQuestionData dynamically based on categoriesWithSelf
            // Initialize categoryAverages dynamically
            const categoryAverages = Object.fromEntries(categoriesWithSelf.map(cat => [cat.categoryName, []]));

            Object.values(questions).forEach(question => {
                categoriesWithSelf.forEach(({ categoryName }) => {
                    const avgScore = calculateAverage(question.responses[categoryName] || []);
                    categoryAverages[categoryName].push(avgScore);
                });
            });

            // Calculate overall averages
            const overallAverages = Object.fromEntries(
                Object.entries(categoryAverages).map(([category, scores]) => [category, calculateAverage(scores)])
            );

            return { trait, ...overallAverages };
        });

        // Step 4: Calculate weighted average for categories except Self
        const finalData = transformedData.map(data => {
            const totalWeightedScore = surveyCategoryObject.reduce((acc, role) => {
                const avgScore = data[categoriesRolesObject.find(cat => cat._id === role.category)?.categoryName];
                const weight = role.scoreWeightage || 0;
                return acc + (avgScore * (weight/100));
            }, 0);

            const sumWeights = categoriesRolesObject.reduce((acc, role) => {
                return acc + (data[role.categoryName] || 0);
            }, 0);

            // const averageOfOthers = (totalWeightedScore / sumWeights).toFixed(2);
            const averageOfOthers = totalWeightedScore.toFixed(1);

            return { ...data, averageOfOthers: parseFloat(averageOfOthers) };
        });

        const getHighPotential = () => {
            const traitsWithComparison = finalData.map(item => {
                return {
                    trait: item.trait,
                    selfRating: parseFloat(item.Self).toFixed(1),
                    averageOtherRating: parseFloat(item.averageOfOthers).toFixed(1),
                    difference: (parseFloat(item.Self) - parseFloat(item.averageOfOthers)).toFixed(1)
                };
            });
    
            const highPotentialTraits = traitsWithComparison.filter(item => { return item.selfRating > 4 && item.selfRating < 5 && item.averageOtherRating > 4 && item.averageOtherRating < 5 });
            return highPotentialTraits;
        };
    
        const highPotentialTraits = getHighPotential();

        setProcessedData(highPotentialTraits);
        // console.log("Final Data = ", highPotentialTraits);

    }, [traitCategoryData, traitData, traitQuestionData, surveyCategoryObject, categoriesRolesObject]);

    

    return (
        <>
            {/* <h4>High Potential Traits</h4> */}
            <h4>Traits of Potential Strengths</h4>
            {processedData.length > 0 ? <>
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
                                        {Array.isArray(processedData) && processedData.map((item, index) => (
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
