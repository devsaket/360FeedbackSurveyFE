import React, { useEffect, useState } from 'react'
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import SimpleDonutChart from './Charts/SimpleDonutChart';

const SurveyTraitsForStrengths = ({ traitSelfOthersData, traitCategoryData, traitData, traitQuestionData, surveyCategoryObject, categoriesRolesObject }) => {

    const [processedData, setProcessedData] = useState([]);

    // Map over surveyCategory and add categoryName
    const updatedSurveyCategory = surveyCategoryObject.map((survey, index) => {
        const matchedCategory = categoriesRolesObject.find(category => category._id === survey.category);
        return {
            ...survey,
            categoryName: matchedCategory ? matchedCategory.categoryName : null
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
                    const responses = question.responses[categoryName] || [];
                    // Filter out 0 responses.
                    const nonZeroResponses = responses.filter(response => response !== 0);
                    // Only if there are non-zero responses, calculate and push the average.
                    if (nonZeroResponses.length > 0) {
                        const avgScore = calculateAverage(nonZeroResponses);
                        categoryAverages[categoryName].push(avgScore);
                    }
                    // const avgScore = calculateAverage(question.responses[categoryName] || []);
                    // categoryAverages[categoryName].push(avgScore);
                });
            });

            // Calculate overall averages
            const overallAverages = Object.fromEntries(
                Object.entries(categoryAverages).map(([category, scores]) => [category, scores.length > 0 ? calculateAverage(scores) : 0])
            );

            return { trait, ...overallAverages };
        });

        // Step 4: Calculate weighted average for categories except Self
        const finalData = transformedData.map(data => {
            const totalWeightedScore = surveyCategoryObject.reduce((acc, role) => {
                const avgScore = data[categoriesRolesObject.find(cat => cat._id === role.category)?.categoryName];
                const weight = role.scoreWeightage || 0;
                return acc + (avgScore * (weight / 100));
            }, 0);

            const sumWeights = categoriesRolesObject.reduce((acc, role) => {
                return acc + (data[role.categoryName] || 0);
            }, 0);

            // const averageOfOthers = (totalWeightedScore / sumWeights).toFixed(2);
            const averageOfOthers = totalWeightedScore.toFixed(1);

            return { ...data, averageOfOthers: parseFloat(averageOfOthers) };
        });

        const filterTopTraits = () => {
            return finalData.filter(item => {
                const selfRating = parseFloat(item.Self);
                const averageOtherRating = parseFloat(item.averageOfOthers);
                return selfRating >= 5 && averageOtherRating >= 5;
            });
        };

        const topTraits = filterTopTraits();

        setProcessedData(topTraits);
        // console.log("Final Data = ", topTraits);

    }, [traitCategoryData, traitData, traitQuestionData, surveyCategoryObject, categoriesRolesObject]);
    

    return (
        <>
            {/* <h4>Traits denoting your strengths</h4> */}
            <h4>Traits of Strength</h4>
            {processedData.length > 0 ?
                <>
                    {/* <ul>
                        {topTraitsOfStrength.map((trait, idx) => (
                            <li key={idx}>
                                <strong>{trait.trait}</strong> - Self Rating: {trait.selfRating}, Average Other Rating: {trait.averageOtherRating}
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
                            {Array.isArray(processedData) && processedData.map((item, index) => (
                                <tr key={index}>
                                    <td className='align-middle'>
                                        <h3>{item.trait}</h3>
                                        {/* <p>This section will be used to rate the employee based on their {item.trait}</p> */}
                                    </td>
                                    <td><SimpleDonutChart key={index} data={item.Self} trait={item.trait} /></td>
                                    <td><SimpleDonutChart key={index} data={item.averageOfOthers} trait={item.trait} /></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    {/* <ResponsiveContainer width="100%" height={400}>
                        <BarChart data={topTraitsOfStrength}>
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

export default SurveyTraitsForStrengths