import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link, useParams } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import LikertScale from './../LikertScale/LikertScale';


const SurveyPreviewRespondents = () => {
    const { id, subjectId, respondentId } = useParams();
    let count = 0;
    
    const [surveyDe, setSurveyDe] = useState([]);
    const [Trait, setTrait] = useState([]);
    const [Questions, setQuestions] = useState([]);

    const [responses, setResponses] = useState([]);

    useEffect(() => {
        const fetchSurveyData = async () => {

            const TraitResponse = await axios.get('http://localhost:5454/api/v1/trait/')
            setTrait(TraitResponse.data)

            const questionResponse = await axios.get('http://localhost:5454/api/v1/question/')
            setQuestions(questionResponse.data)

            const surveyResponse = await axios.get(`http://localhost:5454/api/v1/survey?id=${id}`)
            setSurveyDe(surveyResponse.data)
        };

        fetchSurveyData();
    }, [id])

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
    };

    const handleRespondentResponseSubmit = (e) => {
        e.preventDefault();
        console.log('Survey Responses:', responses);
        // Add logic to send responses to the server or handle them as needed

        const respondentResponseData = {surveyId:id, subjectId:subjectId, respondentId: respondentId ,responses:responses}

        axios.put(`http://localhost:5454/api/v1/update-respondent-response`, respondentResponseData)
        .then(res =>{
            toast.success('Respondent Response Data Stored successfully!');
        }).catch (error => {
            toast.warn('Failed to Store Respondent Response Data!');
        })
    };

    return (
        <>
            <ToastContainer />
            <div className="container my-3 justify-content-end bg-light-50">
                {surveyDe?.map((survey) => {
                    return (
                        <>
                            <div className="row border-bottom" key={survey._id}>
                                <div className="col-12 d-flex flex-row justify-content-between align-items-center my-3 border-bottom border-3">
                                    <h1 className="text-dark">{survey.surveyName}</h1>
                                </div>

                                <div className="col-12 mt-4">
                                    <p className='ps-3'>{survey.surveyDescription}</p>
                                </div>

                                <form onSubmit={handleRespondentResponseSubmit}>
                                    <div className="col-12">
                                        {survey.traits.map(traitId => {
                                            const trait = Trait.find(t => t._id === traitId);
                                            if (trait) {
                                                return (
                                                    <div key={trait._id}>
                                                        <h4 className=''>{trait.traitName}</h4>
                                                        <p>{trait.traitDescription}</p>

                                                        {survey.questions
                                                            .map((questionId) => {
                                                                const question = Questions.find(question => question._id === questionId && question.trait._id === traitId);
                                                                if (question) {
                                                                    count++;
                                                                    return (
                                                                        <>
                                                                            <div className='bg-body-secondary my-3 py-3 px-5' key={question._id}>
                                                                                <h3 className='fw-semibold'>Question {count}</h3>
                                                                                <p className='ps-5'>{ question.questionOthers }</p>
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
                                        <button type="submit" className='btn btn-primary'>Submit</button>
                                    </div>
                                </form>
                            </div>
                        </>
                    )
                })}
            </div>
        </>
    )
}

export default SurveyPreviewRespondents