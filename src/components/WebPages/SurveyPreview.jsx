import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link, useParams } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import LikertScale from './../LikertScale/LikertScale';


const SurveyPreview = () => {
    const { id, subjectId } = useParams();
    let count = 0;

    const [surveyDe, setSurveyDe] = useState([]);
    const [Trait, setTrait] = useState([]);
    const [Questions, setQuestions] = useState([]);

    const [responses, setResponses] = useState([]);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [answers, setAnswers] = useState({});   // { [questionId]: 1-7 | 0 }

    useEffect(() => {
        const fetchSurveyData = async () => {

            const TraitResponse = await axios.get(process.env.REACT_APP_BACKEND_URL + '/trait/')
            setTrait(TraitResponse.data)

            const questionResponse = await axios.get(process.env.REACT_APP_BACKEND_URL + '/question/')
            setQuestions(questionResponse.data)

            const surveyResponse = await axios.get(process.env.REACT_APP_BACKEND_URL + `/survey?id=${id}`)
            setSurveyDe(surveyResponse.data)

            const surveyResponseIsFilled = await axios.get(process.env.REACT_APP_BACKEND_URL + `/survey-response/is-filled/${id}/${subjectId}`)
            setIsSubmitted(surveyResponseIsFilled.data.isFilled)
        }

        fetchSurveyData();
    }, [id, subjectId])

    const handleResponseChange = (questionId, answer) => {
        setResponses(prevResponses => {
            const newResponses = [...prevResponses];
            const existingResponseIndex = newResponses.findIndex(response => response.questionId === questionId);
            if (existingResponseIndex >= 0) {
                newResponses[existingResponseIndex].answer = answer;
            } else {
                newResponses.push({ questionId, answer });
            }
            return newResponses;
        });

        setAnswers(prev => ({ ...prev, [questionId]: answer }));
    };

    // const handleResponseChange = (questionId, answer) => {
    //     setAnswers(prev => ({ ...prev, [questionId]: answer }));
    // };

    const allQuestionIds = React.useMemo(() => {
        if (!Array.isArray(surveyDe) || !Trait.length || !Questions.length) return [];
        return surveyDe.flatMap(survey =>
            survey.questions.filter(qId => {
                const q = Questions.find(q => q._id === qId);
                // keep only questions whose trait is in this survey’s traits
                return q && survey.traits.includes(q.trait._id);
            })
        );
    }, [surveyDe, Trait, Questions]);

    const canSubmit = allQuestionIds.length > 0 &&
        allQuestionIds.every(id => answers[id] !== undefined);
        // allQuestionIds.every(id => (answers[id] ?? -1) > 0);  //If you want to exclude “Unable to rate” (answer 0) from counting as filled

    const handleSubjectResponseSubmit = (e) => {
        e.preventDefault();
        // console.log('Survey Responses:', responses);

        if (!canSubmit) {
            toast.warn('Please select responses for all the questions');
            return;
        }

        // Add logic to send responses to the server or handle them as needed
        const subjectResponseData = { surveyId: id, subjectId: subjectId, subjectResponses: responses }

        axios.put(process.env.REACT_APP_BACKEND_URL + '/update-subject-response', subjectResponseData)
            .then(res => {
                toast.success('Subject Response Data Stored successfully!');
                setIsSubmitted(true);
            }).catch(error => {
                toast.warn('Failed to Store Subject Response Data!');
                setIsSubmitted(false);
            })
    };

    return (
        <>
            <ToastContainer />
            <div className="container my-3 justify-content-end bg-light-50" >
                {!isSubmitted ? Array.isArray(surveyDe) && surveyDe?.map((survey) => {
                    return (
                        <>
                            <div className="row border-bottom" key={survey._id}>
                                <div className="col-12 d-flex flex-row justify-content-between align-items-center my-3 border-bottom border-3">
                                    <h1 className="text-dark d-flex">{survey.surveyName}</h1>
                                </div>

                                <div className="col-12 mt-4">
                                    <p className='ps-3 d-flex'>{survey.surveyDescription}</p>
                                </div>

                                <form onSubmit={handleSubjectResponseSubmit}>
                                    <div className="col-12" >
                                        {Array.isArray(survey.traits) && survey.traits.map(traitId => {
                                            const trait = Trait.find(t => t._id === traitId);
                                            if (trait) {
                                                return (
                                                    <div key={trait._id}>
                                                        {/* <h4 className=''>{trait.traitName}</h4> */}
                                                        {/* <p>{trait.traitDescription}</p> */}

                                                        {Array.isArray(survey.questions) && survey.questions.map((questionId) => {
                                                            const question = Questions.find(question => question._id === questionId && question.trait._id === traitId);
                                                            if (question) {
                                                                count++;
                                                                return (
                                                                    <>
                                                                        <div className='bg-body-secondary my-3 py-3 px-5' key={question._id}>
                                                                            <h3 className='fw-semibold'>Question {count}</h3>
                                                                            <p className='ps-5 d-flex' >{question.question}</p>
                                                                            <LikertScale questionId={question._id} onResponseChange={handleResponseChange} />
                                                                        </div>
                                                                    </>
                                                                )
                                                            }
                                                        })}
                                                    </div>
                                                );
                                            }
                                        })}
                                    </div>
                                    <div className="col-12 text-center">
                                        <button type="submit" className='btn btn-primary' disabled={!canSubmit}>Submit</button>
                                    </div>
                                </form>
                            </div>
                        </>
                    )
                })
                    : <>
                        <div className='d-flex justify-content-center'>
                            <p className='display-4 text-center w-50'>Submission is Successful and THank you for Participation</p>
                        </div>
                    </>
                }
            </div>
        </>
    )
}

export default SurveyPreview