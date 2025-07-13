import React, { useEffect, useState } from 'react';
import { Card, CardBody, CardHeader, Table } from 'react-bootstrap';
import ProgressBar from './Charts/ProgressBar';

const SurveyParticipationDataArabic = ({ summaryData, surveyCategoryObject, categoriesRolesObject }) => {

    // Merge data based on the relationship category
    const mergedData = summaryData.map(summary => {
        // Find matching category in surveyCategoryObject by name
        const matchingSurveyCategory = categoriesRolesObject.find(cat => 
            surveyCategoryObject.some(surveyCat => surveyCat.category === cat._id && cat.categoryName === summary.category)
        );

        const scoreWeightage = matchingSurveyCategory
            ? surveyCategoryObject.find(surveyCat => surveyCat.category === matchingSurveyCategory._id)?.scoreWeightage
            : (summary.category === 'Self' ? 100 : 0); // Default to 100 for 'Self' if not found

        // console.log("Survey Participation Data = ", {...summary, scoreWeightage});

        return {
            ...summary,
            scoreWeightage
        };
    });

    return (
        <>
            <CardHeader>
                <h3>Survey Participation Data</h3>
            </CardHeader>
            <CardBody>
                <p>Lorem ipsum dolor sit amet consectetur adipisicing elit. Eaque, temporibus id, earum incidunt repellendus assumenda placeat aliquid exercitationem dignissimos alias est vero sunt similique optio deleniti distinctio fugit illo repellat?</p>
                <table className='table table-bordered'>
                    <thead className='thead-dark'>
                        <tr>
                            <th className='text-wrap align-top text-start'><b className='text-white'>Relationship</b></th>
                            <th className='text-wrap align-top text-center'><b className='text-white'>Score Weightage</b></th>
                            <th className='text-wrap align-top text-center'><b className='text-white'>Nominated</b></th>
                            <th className='text-wrap align-top text-center'><b className='text-white'>Completed</b></th>
                            <th className='text-wrap align-top text-center'><b className='text-white'>Completion Rate</b></th>
                        </tr>
                    </thead>
                    <tbody>
                        {Array.isArray(mergedData) && mergedData.map((row, index) => (
                            <tr key={index}>
                                <td className='font-weight-bold'>{row.category === "Self" ? 'Self' : row.category}</td>
                                <td className='text-wrap align-top text-center align-middle'>{row.scoreWeightage} %</td>
                                <td className='text-wrap align-top text-center align-middle'>{row.nominated}</td>
                                <td className='text-wrap align-top text-center align-middle'>{row.completed}</td>
                                <td className='align-middle'>
                                {/* <progress value={row.completionRate}  max={100} className='w-100' /><span className='px-2'>{row.completionRate}%</span>  */}
                                    <ProgressBar completed={row.completionRate} max={100} />
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </CardBody>
        </>
    )
}

export default SurveyParticipationDataArabic