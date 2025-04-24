/*!

=========================================================
* Argon Dashboard React - v1.2.4
=========================================================

* Product Page: https://www.creative-tim.com/product/argon-dashboard-react
* Copyright 2024 Creative Tim (https://www.creative-tim.com)
* Licensed under MIT (https://github.com/creativetimofficial/argon-dashboard-react/blob/master/LICENSE.md)

* Coded by Creative Tim

=========================================================

* The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

*/
import { useState, useEffect } from "react";
// react component that copies the given text inside your clipboard
import { CopyToClipboard } from "react-copy-to-clipboard";
import axios from 'axios';

import 'reactjs-popup/dist/index.css';

import 'react-toastify/dist/ReactToastify.css';
import { Link, useParams } from 'react-router-dom';

// reactstrap components
import {
    Card,
    CardHeader,
    CardBody,
    Container,
    Row,
    
} from "reactstrap";
// core components
import Header from "components/Headers/Header.js";
import LikertScale from "components/LikertScale/LikertScale";



const SurveyDetailsArabic = () => {
    const { id } = useParams();
    let count = 0;
    const [copiedText, setCopiedText] = useState();
    const [modal, setModal] = useState(false);
    const toggle = () => setModal(!modal);

    const [btnActive, setBtnActive] = useState(true)

    const [surveyDe, setSurveyDe] = useState([]);
    const [Trait, setTrait] = useState([]);
    const [Questions, setQuestions] = useState([]);
    const [selectNA, setSelectNA] = useState([])

    useEffect(() => {
        const fetchSurveyData = async () => {

            const TraitResponse = await axios.get(process.env.REACT_APP_BACKEND_URL + '/trait/')
            setTrait(TraitResponse.data)

            const questionResponse = await axios.get(process.env.REACT_APP_BACKEND_URL + '/question/')
            setQuestions(questionResponse.data)

            const surveyResponse = await axios.get(process.env.REACT_APP_BACKEND_URL + `/survey?id=${id}`)
            setSurveyDe(surveyResponse.data)
        };

        fetchSurveyData();
    }, [id])


    return (
        <>
            <Header />
            {/* Page content */}
            <Container className="mt--7" fluid>
                {/* Table */}

                <Row className="mt--3">
                    <div className="col">
                        <Card className="shadow">
                            {Array.isArray(surveyDe) && surveyDe?.map((survey) => {
                                return (
                                    <>
                                        <CardHeader className="bg-transparent d-flex justify-content-between align-items-center">
                                            <h3 className="mb-0">{survey.surveyName}</h3>
                                            <div className='d-flex flex-row '>
                                                <div className='mx-3'>
                                                    <button className='btn btn-primary' onClick={() => setBtnActive(true)} disabled={btnActive}>Subject</button>
                                                    <button className='btn btn-primary' onClick={() => setBtnActive(false)} disabled={!btnActive}>Respondents</button>
                                                </div>

                                                <Link to={`/admin/survey-share-email/${survey._id}`} className="btn btn-info px-4 me-2">Share By Email</Link>
                                                <Link to={`/admin/survey-share-by-sms/${survey._id}`} className="btn btn-info px-4">Share By SMS</Link>
                                            </div>
                                        </CardHeader>
                                        <CardBody key={survey._id}>

                                                <div className="col-12 mt-4">
                                                    <p className='ps-3'>{survey.surveyDescription}</p>
                                                </div>

                                                <div className="col-12">
                                                    {Array.isArray(survey.traits) && survey.traits.map(traitId => {
                                                        const trait = Trait.find(t => t._id === traitId);
                                                        if (trait) {
                                                            return (
                                                                <div key={trait._id}>
                                                                    {/* <h4 className=''>{trait.traitName}</h4> */}
                                                                    {/* <p>{trait.traitDescription}</p> */}

                                                                    {Array.isArray(survey.questions) && survey.questions
                                                                        .map((questionId) => {
                                                                            const question = Questions.find(question => question._id === questionId && question.trait._id === traitId);
                                                                            if (question) {
                                                                                count++;
                                                                                return (
                                                                                    <>
                                                                                        <div className='bg-secondary my-3 py-3 px-5' key={question._id}>
                                                                                            <h3 className='fw-semibold'>Question {count}</h3>
                                                                                            <p className='ps-5'>{btnActive ? question.question : question.questionOthers}</p>
                                                                                            <LikertScale />
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

                                        </CardBody>

                                    </>
                                )
                            })}
                        </Card>
                        <Card className="d-flex flex-row justify-content-center py-3">
                                <Link to={`/website/survey-preview/${id}`} target="_blank" className="btn btn-success px-4 me-2">Preview for Subject</Link>
                                {/* <Link to={`/survey-respondent/${id}`} target="_blank" className="btn btn-success px-4 me-2">Preview for Respondent</Link> */}
                                <Link to={`/admin/survey-share-email/${id}`} className="btn btn-info px-4 me-2">Share By Email</Link>
                                <Link to={`/admin/share-by-sms/${id}`} className="btn btn-info px-4">Share By SMS</Link>
                        </Card>
                    </div>
                </Row>
            </Container>
        </>
    );
};

export default SurveyDetailsArabic;
