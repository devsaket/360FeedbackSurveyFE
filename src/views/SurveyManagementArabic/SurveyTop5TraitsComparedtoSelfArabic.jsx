import React, { useEffect, useState } from 'react'
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import SimpleDonutChart from './Charts/SimpleDonutChart';

const SurveyTop5TraitsComparedToSelfArabic = ({ traitSelfOthersData, traitCategoryData, traitData, traitQuestionData, surveyCategoryObject, categoriesRolesObject }) => {

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
    // const categoriesWithSelf = [{ categoryName: 'Self', color: '#0088FE' }, ...updatedSurveyCategory];
    const categoriesWithSelf = [{ categoryName: 'تقييم ذاتي', color: '#0088FE' }, ...updatedSurveyCategory];

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
                    // Filter out 0 responses
                    const nonZeroResponses = responses.filter(response => response !== 0);
                    //Only if there are non-zero responses, calculate and push the average.
                    if(nonZeroResponses.length > 0){
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
                return acc + (avgScore * (weight/100));
            }, 0);

            const sumWeights = categoriesRolesObject.reduce((acc, role) => {
                return acc + (data[role.categoryName] || 0);
            }, 0);

            // const averageOfOthers = (totalWeightedScore / sumWeights).toFixed(2);
            const averageOfOthers = totalWeightedScore.toFixed(1);

            return { ...data, averageOfOthers: parseFloat(averageOfOthers) };
        });

        const getTopTraits = () => {
            const traitsWithComparison = finalData.map(item => {
                return {
                    trait: item.trait,
                    // selfRating: parseFloat(item.Self),
                    selfRating: parseFloat(item['تقييم ذاتي']),
                    averageOtherRating: parseFloat(item.averageOfOthers),
                    // difference: parseFloat(item.Self) - parseFloat(item.averageOfOthers)
                    difference: parseFloat(item['تقييم ذاتي']) - parseFloat(item.averageOfOthers)
                };
            });
    
            const sortedTraits = traitsWithComparison.sort((a, b) => b.difference - a.difference);
            const filteredTraits = sortedTraits.filter(trait => trait.difference > 0);
    
            return filteredTraits.slice(0, 5);
        };

        const topTraits = getTopTraits();

        setProcessedData(topTraits);
        // console.log("Final Data = ", topTraits);

    }, [traitCategoryData, traitData, traitQuestionData, surveyCategoryObject, categoriesRolesObject]);

    return (
        <>
            {/* <h4>Hidden Traits with Developmental Needs</h4> */}
            <h4>سمات (جدارات، مهارات، صفات) خفية تحتاج إلى تطوير </h4>
            {/* <ul>
                {processedData.map((trait, idx) => (
                    <li key={idx}>
                        <strong>{trait.trait}</strong> - Self Rating: {trait.selfRating.toFixed(1)}, Average Other Rating: {trait.averageOtherRating.toFixed(1)}, Difference: {trait.difference.toFixed(1)}
                    </li>
                ))}
            </ul> */}

            <table className='table table-bordered'>
                <thead className='thead-white'>
                    <tr>
                        {/* <th className='text-wrap align-top text-start w-25'><b className='text-muted'>Areas</b></th>
                        <th className='text-wrap align-top text-center'><b className='text-muted'>Your Rating</b></th>
                        <th className='text-wrap align-top text-center'><b className='text-muted'>Others Rating</b></th> */}
                        <th className='text-wrap align-top text-start w-25'><b className='text-muted'>السمات(الجدارات، المهارات، الصفات)</b></th>
                        <th className='text-wrap align-top text-center'><b className='text-muted'>تقييم الفرد " تقييم ذاتي "</b></th>
                        <th className='text-wrap align-top text-center'><b className='text-muted'>تقييم الآخرين</b></th>
                    </tr>
                </thead>
                <tbody>
                    {Array.isArray(processedData) && processedData.map((item, index) => (
                        <tr key={index}>
                            <td className='align-middle'>
                                <h3>{item.trait}</h3>
                            </td>
                            <td><SimpleDonutChart key={index} data={item.selfRating} trait={item.trait} /></td>
                            <td><SimpleDonutChart key={index} data={item.averageOtherRating} trait={item.trait} /></td>
                        </tr>
                    ))}
                </tbody>
            </table>

        </>
    )
}

export default SurveyTop5TraitsComparedToSelfArabic
