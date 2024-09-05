import React from 'react'
import { ResponsiveContainer, Treemap, Tooltip, Cell } from 'recharts';

// Customize Tooltip
const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
        return (
            <div className="custom-tooltip">
                <p>{`${payload[0].name}`}</p>
                <p>{`Average Response: ${payload[0].value.toFixed(1)}`}</p>
            </div>
        );
    }
    return null;
};

// Customize labels for Treemap
const CustomizedLabel = ({ x, y, width, height, value }) => {
    return (
        <text x={x + width / 2} y={y + height / 2} textAnchor="middle" fill="#ff6f61">
            {value}
        </text>
    );
};

const SurveyTopBottom5QuestionsForOthers = ({ traitQuestionData }) => {
    const getTopAndBottomOthersQuestions = () => {
        const allQuestions = [];

        // Collect all responses excluding those with 0 response
        for (const trait in traitQuestionData) {
            for (const questionId in traitQuestionData[trait]) {
                const questionData = traitQuestionData[trait][questionId];
                const validResponses = questionData.responses.filter(response => response > 0);
                if (validResponses.length > 0) {
                    const averageResponse = validResponses.reduce((acc, score) => acc + score, 0) / validResponses.length;
                    allQuestions.push({
                        questionText: questionData.questionText,
                        averageResponse
                    });
                }
            }
        }

        // Sort questions by average response
        const sortedQuestions = allQuestions.sort((a, b) => b.averageResponse - a.averageResponse);

        // Get top 5 and bottom 5 questions
        const topOtherQuestions = sortedQuestions.slice(0, 3);
        const bottomOtherQuestions = sortedQuestions.slice(-3);

        return { topOtherQuestions, bottomOtherQuestions };
    }

    const { topOtherQuestions, bottomOtherQuestions } = getTopAndBottomOthersQuestions();

    // Prepare data for the Treemap
    const treemapData = [
        { name: 'Top Questions', children: topOtherQuestions.map(q => ({ name: q.questionText, value: q.averageResponse, color: '#82ca9d' })) },
        { name: 'Bottom Questions', children: bottomOtherQuestions.map(q => ({ name: q.questionText, value: q.averageResponse, color: '#ff6f61' })) }
    ];

    return (
        <>
            <h2>Top Rated Statements by Others </h2>
            {/* <h4>Top 5 Questions</h4> */}
            <ul>
                {topOtherQuestions.map((question, idx) => (
                    <>
                        {/* <li key={idx}>{question.questionText} - Average Response: {question.averageResponse.toFixed(1)}</li> */}
                        <li key={idx}>{question.questionText} - Average Response: {question.averageResponse.toFixed(1)}</li>
                    </>

                ))}
            </ul>
            {/* <h4>Bottom 5 Questions</h4> */}
            <h2>Bottom Rated Statements by Others </h2>
            <ul>
                {bottomOtherQuestions.map((question, idx) => (
                    <>
                        {/* <li key={idx}>{question.questionText} - Average Response: {question.averageResponse.toFixed(1)}</li> */}
                        <li key={idx}>{question.questionText} - Average Response: {question.averageResponse.toFixed(1)}</li>
                    </>
                ))}
            </ul>

            <h4>Treemap Representation</h4>
            <ResponsiveContainer width="100%" height={400}>
                <Treemap
                    data={treemapData}
                    dataKey="value"
                    stroke="#000"
                    // fill="#8884d8"
                    label={<CustomizedLabel />} // Optional: Customize labels
                >
                   {
                        treemapData.flatMap(group => 
                            group.children.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} /> // Apply color from data
                            ))
                        )
                    }
                    <Tooltip content={<CustomTooltip />} />
                </Treemap>
            </ResponsiveContainer>
        </>
    )
}

export default SurveyTopBottom5QuestionsForOthers
