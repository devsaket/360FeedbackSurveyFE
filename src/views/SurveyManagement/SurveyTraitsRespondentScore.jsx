import React, { useEffect, useState } from 'react'
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from 'recharts';
import ProgressBar from './Charts/ProgressBar';

const SurveyTraitsRespondentScore = ({ traitRespondentsData, traitCategoryData, traitData, traitQuestionData, surveyCategoryObject, categoriesRolesObject }) => {

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
        return acc + (avgScore * (weight / 100));
      }, 0);

      const sumWeights = categoriesRolesObject.reduce((acc, role) => {
        return acc + (data[role.categoryName] || 0);
      }, 0);

      // const averageOfOthers = (totalWeightedScore / sumWeights).toFixed(2);
      const averageOfOthers = totalWeightedScore.toFixed(1);

      return { ...data, averageOfOthers: parseFloat(averageOfOthers) };
    });

    setProcessedData(finalData);

  }, [traitCategoryData, traitData, traitQuestionData, surveyCategoryObject, categoriesRolesObject]);

 
  const traitOthersRating = processedData.sort((a, b) => parseFloat(b.averageOfOthers) - parseFloat(a.averageOfOthers));

  return (
    <>
      <h2>Ranking of Traits Based on the Average of Multi-Raters’ Feedback Scoring</h2>
      {
        traitOthersRating.map((item, index) => {
          return (
            <>
              <div key={index} className='d-flex flex-row justify-content-between'>
                <h3>{item.trait}</h3>
                {/* <p>{item.averageOtherRating}</p> */}
                <div className='w-25'>
                  <ProgressBar bgcolor="#6a1b9a" completed={item.averageOfOthers.toFixed(1)} max={7} />
                </div>
              </div>
            </>
          )
        })
      }
    </>
  )
}

export default SurveyTraitsRespondentScore
