import React from 'react'

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
        const topOtherQuestions = sortedQuestions.slice(0, 5);
        const bottomOtherQuestions = sortedQuestions.slice(-5);

        return { topOtherQuestions, bottomOtherQuestions };
    }

    const { topOtherQuestions, bottomOtherQuestions } = getTopAndBottomOthersQuestions();

    return (
        <>
            <h2>Top 5 & Bottom 5 Questions from Others</h2>
            <h4>Top 5 Questions (Highest Responses)</h4>
            <ul>
                {topOtherQuestions.map((question, idx) => (
                    <>
                        {/* <li key={idx}>{question.questionText} - Average Response: {question.averageResponse.toFixed(1)}</li> */}
                        <li key={idx}>{question.questionText}</li>
                    </>

                ))}
            </ul>
            <h4>Bottom 5 Questions (Lowest Responses)</h4>
            <ul>
                {bottomOtherQuestions.map((question, idx) => (
                    <>
                        {/* <li key={idx}>{question.questionText} - Average Response: {question.averageResponse.toFixed(1)}</li> */}
                        <li key={idx}>{question.questionText} </li>
                    </>
                ))}
            </ul>
        </>
    )
}

export default SurveyTopBottom5QuestionsForOthers
