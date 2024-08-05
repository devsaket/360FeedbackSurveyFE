import React from 'react'

const SurveyTopBottom5QuestionsForSelf = ({ subjectObject, questionObjects }) => {

    const getTopAndBottomSelfQuestions = (subject) => {
        const responses = subject.responses.filter(response => response.answer > 0); // Filter out responses with 0
        const sortedResponses = responses.map(response => {
            const question = questionObjects.find(q => q._id === response.questionId);
            return {
                questionText: question ? question.question : '',
                response: parseInt(response.answer, 10)
            };
        }).sort((a, b) => b.response - a.response);

        const topQuestions = sortedResponses.slice(0, 5);
        const bottomQuestions = sortedResponses.reverse().slice(0, 5);

        return { topQuestions, bottomQuestions };
    };

    const subject = subjectObject.length ? subjectObject[0] : null;
    const subjectQuestions = subject ? getTopAndBottomSelfQuestions(subject) : { topQuestions: [], bottomQuestions: [] };

    return (
        <>
            <h2>Top 5 & Bottom 5 Questions from self</h2>
            {subject && (
                <div>
                    {/* <h2>Subject Specific Questions</h2> */}
                    <h4>Top 5 Questions</h4>
                    <ul>
                        {subjectQuestions.topQuestions.map((question, idx) => (
                            <li key={idx}>{question.questionText} - Response: {question.response}</li>
                        ))}
                    </ul>
                    <h4>Bottom 5 Questions</h4>
                    <ul>
                        {subjectQuestions.bottomQuestions.map((question, idx) => (
                            <li key={idx}>{question.questionText} - Response: {question.response}</li>
                        ))}
                    </ul>
                </div>
            )}
        </>
    )
}

export default SurveyTopBottom5QuestionsForSelf
