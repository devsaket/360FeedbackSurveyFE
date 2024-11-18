import React from 'react'

const SurveyTopBottom5QuestionsForOthers = ({ traitQuestionData }) => {
    const getTopAndBottomOthersQuestions = () => {
        const allQuestions = [];

        // Collect all responses excluding "Self"
        for (const trait in traitQuestionData) {
            for (const questionId in traitQuestionData[trait]) {
                const questionData = traitQuestionData[trait][questionId];

                // Collect all responses excluding Self
                const otherResponses = Object.entries(questionData.responses)
                    .filter(([category]) => category !== "Self") // Exclude "Self" category
                    .flatMap(([, responses]) => responses); // Flatten response arrays

                if (otherResponses.length > 0) {
                    const totalResponse = otherResponses.reduce((acc, score) => acc + score, 0);
                    allQuestions.push({
                        questionText: questionData.questionText,
                        totalResponse
                    });
                }
            }
        }

        // Sort questions by total response
        const sortedQuestions = allQuestions.sort((a, b) => b.totalResponse - a.totalResponse);

        // Get top 3 and bottom 3 questions
        const topOtherQuestions = sortedQuestions.slice(0, 3);
        const bottomOtherQuestions = sortedQuestions.slice(-3);

        return { topOtherQuestions, bottomOtherQuestions };
    };

    const { topOtherQuestions, bottomOtherQuestions } = getTopAndBottomOthersQuestions();

    return (
        <>
            <h2>Top Rated Statements by Others</h2>
            {topOtherQuestions.map((question, idx) => (
                <div key={idx} className={`d-flex statement-main-box ${idx === 1 ? 'flex-row-reverse' : 'flex-row'}`}>
                    <div className='statement-box bg-primary'>
                        <h6 className='statement-head'>Statement</h6>
                        <p className='statement-text'>{idx + 1}</p>
                    </div>
                    <div className='question-box'>
                        <div className='question-text'>
                            <p>{question.questionText}</p>
                        </div>
                        <hr />
                    </div>
                </div>
            ))}

            <h2>Bottom Rated Statements by Others</h2>
            {bottomOtherQuestions.map((question, idx) => (
                <div key={idx} className={`d-flex statement-main-box ${idx === 1 ? 'flex-row-reverse' : 'flex-row'}`}>
                    <div className='statement-box bg-danger'>
                        <h6 className='statement-head'>Statement</h6>
                        <p className='statement-text'>{idx + 1}</p>
                    </div>
                    <div className='question-box'>
                        <div className='question-text'>
                            <p>{question.questionText}</p>
                        </div>
                        <hr />
                    </div>
                </div>
            ))}

        </>
    )
}

export default SurveyTopBottom5QuestionsForOthers
