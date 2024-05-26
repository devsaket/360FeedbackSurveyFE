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

import Popup from 'reactjs-popup';
import 'reactjs-popup/dist/index.css';
import { toast, ToastContainer } from 'react-toastify';
import { useForm } from "react-hook-form";
import { joiResolver } from "@hookform/resolvers/joi";
import Joi from "@hapi/joi";
import 'react-toastify/dist/ReactToastify.css';
import { Link, useParams } from 'react-router-dom';
import TextareaAutosize from 'react-textarea-autosize';

// reactstrap components
import {
    Card,
    CardHeader,
    CardBody,
    Container,
    Row,
    Col,
    UncontrolledTooltip, Modal, ModalHeader, ModalBody, ModalFooter, Button
} from "reactstrap";
// core components
import Header from "components/Headers/Header.js";
import { exportToExcel } from './excelUtils';

const SurveyResultManagement = () => {
    const [copiedText, setCopiedText] = useState();

    const { surveyId } = useParams();

    const [surveyResult, setSurveyResult] = useState([]);

    useEffect(() => {
        // Fetch surveys from the backend
        axios.get(`http://localhost:5454/api/v1/survey-response/${surveyId}`)
            .then(response => {
                setSurveyResult(response.data);
                console.log(response.data);
            })
            .catch(error => {
                console.error('Error fetching surveys:', error);
            });
    }, []);

    const handleDownload = () => {
        exportToExcel(surveyResult, 'Survey_Responses');
    };

    return (
        <>
            <Header />
            {/* Page content */}
            <Container className="mt--7" fluid>
                {/* Table */}

                <Row className="mt--3">
                    <div className="col">
                        <Card className="shadow">
                            <CardHeader className="bg-transparent d-flex justify-content-between align-items-center">
                                <h3 className="mb-0">Survey Result</h3>
                                <Button onClick={handleDownload}>Download Excel</Button>
                            </CardHeader>
                            <CardBody>
                            {surveyResult.map((survey, index) => (
                                    <div key={index}>
                                        <h2>Survey ID: {survey.surveyId}</h2>
                                        <p>Subject Name: {survey.subject.subjectName}</p>
                                        <p>Subject Email: {survey.subject.subjectEmail}</p>
                                        <p>Created On: {new Date(survey.createdOn).toLocaleString()}</p>

                                        <h3>Subject Responses:</h3>
                                        <ul>
                                            {survey.subject.responses.map((response, idx) => (
                                                <li key={idx}>
                                                    Question ID: {response.questionId} - Answer: {response.answer}
                                                </li>
                                            ))}
                                        </ul>

                                        <h3>Respondents:</h3>
                                        {survey.respondent.map((respondent, respIndex) => (
                                            <div key={respIndex}>
                                                <h4>Respondent Name: {respondent.respondentName}</h4>
                                                <p>Email: {respondent.respondentEmail}</p>
                                                <p>Category: {respondent.category}</p>

                                                <h5>Responses:</h5>
                                                <ul>
                                                    {respondent.responses.map((resp, responseIndex) => (
                                                        <li key={responseIndex}>
                                                            Question ID: {resp.questionId} - Answer: {resp.answer}
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        ))}
                                    </div>
                                ))}
                            </CardBody>
                        </Card>
                    </div>
                </Row>
            </Container>
        </>
    );
};

export default SurveyResultManagement;
