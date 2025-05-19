import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link, useParams } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import LikertScale from '../LikertScale/LikertScale';


const SurveyPreviewProduct = () => {
    const { id } = useParams();
    let count = 0;

    const [surveyDe, setSurveyDe] = useState([]);
    const [Trait, setTrait] = useState([]);
    const [Questions, setQuestions] = useState([]);

    const [responses, setResponses] = useState([]);
    const [isSubmitted, setIsSubmitted] = useState(false);

    const [btnActive, setBtnActive] = useState(true)

    useEffect(() => {
        const fetchSurveyData = async () => {

            const TraitResponse = await axios.get(process.env.REACT_APP_BACKEND_URL + '/trait/')
            setTrait(TraitResponse.data)

            const questionResponse = await axios.get(process.env.REACT_APP_BACKEND_URL + '/question/')
            setQuestions(questionResponse.data)

            const surveyResponse = await axios.get(process.env.REACT_APP_BACKEND_URL + `/survey?id=${id}`)
            setSurveyDe(surveyResponse.data)
        }

        fetchSurveyData();
    }, [id])

    // const handleResponseChange = (questionId, answer) => {
    //     setResponses(prevResponses => {
    //         const newResponses = [...prevResponses];
    //         const existingResponseIndex = newResponses.findIndex(response => response.questionId === questionId);
    //         if (existingResponseIndex >= 0) {
    //             newResponses[existingResponseIndex].answer = answer;
    //         } else {
    //             newResponses.push({ questionId, answer });
    //         }
    //         return newResponses;
    //     });
    // };

    // const handleSubjectResponseSubmit = (e) => {
    //     e.preventDefault();
    //     console.log('Survey Responses:', responses);
    //     // Add logic to send responses to the server or handle them as needed

    //     const subjectResponseData = {surveyId:id, subjectId:subjectId, subjectResponses:responses}

    //     axios.put(process.env.REACT_APP_BACKEND_URL+'/update-subject-response', subjectResponseData)
    //     .then(res =>{
    //         toast.success('Subject Response Data Stored successfully!');
    //         setIsSubmitted(true);
    //     }).catch (error => {
    //         toast.warn('Failed to Store Subject Response Data!');
    //         setIsSubmitted(false);
    //     })
    // };

    return (
        <>
            <div className="container my-3 justify-content-end bg-light-50">
                {!isSubmitted ? Array.isArray(surveyDe) && surveyDe?.map((survey) => {
                    return (
                        <>
                            <div className="row border-bottom" key={survey._id}>
                                <div className="col-12 d-flex flex-row justify-content-between align-items-center mt-3 border-bottom border-3 bg-white">
                                    <h1 className="text-dark">{survey.surveyName}</h1>

                                    <div>
                                    <div className='mx-3'>
                                                    {/* <button className='btn btn-primary' onClick={() => setBtnActive(true)} disabled={btnActive}>Subject</button> */}
                                                    <button className='btn btn-primary' onClick={() => setBtnActive(true)} disabled={btnActive}>الفرد المُقيَّم</button>
                                                    {/* <button className='btn btn-primary' onClick={() => setBtnActive(false)} disabled={!btnActive}>Respondents</button> */}
                                                    <button className='btn btn-primary' onClick={() => setBtnActive(false)} disabled={!btnActive}>االمقيمون الآخرون</button>
                                                </div>
                                    {/* <Link to={`/website/survey-user-share-email/${survey._id}`} className="btn btn-info px-4 me-2">Share By Email</Link> */}
                                    <Link to={`/website/survey-user-share-email/${survey._id}`} className="btn btn-info px-4 me-2">مشاركة عبر البريد الإلكتروني</Link>
                                    {/* <Link to={`/website/survey-user-share-sms/${survey._id}`} className="btn btn-info px-4">Share By SMS</Link> */}
                                    <Link to={`/website/survey-user-share-sms/${survey._id}`} className="btn btn-info px-4">مشاركة عبر الرسائل النصية</Link>
                                    {/* <Link to={`/website/survey-result-user/${survey._id}`} className="btn btn-primary px-4">Survey Result</Link> */}
                                    <Link to={`/website/survey-result-user/${survey._id}`} className="btn btn-primary px-4">Survey Result</Link>
                                    </div>
                                </div>

                                <div className="col-12 bg-white shadow py-2">
                                    <p className='ps-3'>{survey.surveyDescription}</p>
                                </div>

                                <form onSubmit={() => { }}>
                                    <div className="col-12">
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
                                                                            {/* <h3 className='fw-semibold'>Question {count}</h3> */}
                                                                            <h3 className='fw-semibold'>السؤال {count}</h3>
                                                                            <p className='ps-5'>{btnActive ? question.question : question.questionOthers}</p>
                                                                            <LikertScale questionId={question._id} onResponseChange={() => { }} />
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
                                    {/* <div className="col-12 text-center">
                                        <button type="submit" className='btn btn-primary' disabled>Submit</button>
                                    </div> */}
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

export default SurveyPreviewProduct