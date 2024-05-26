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
import * as XLSX from 'xlsx';
import Select from 'react-select'
import { toast, ToastContainer } from 'react-toastify';
import TextareaAutosize from 'react-textarea-autosize';

// reactstrap components
import {
    Card,
    CardHeader,
    CardBody,
    Container,
    Row,
    CardTitle,
    Button,

} from "reactstrap";
// core components
import Header from "components/Headers/Header.js";
import LikertScale from "components/LikertScale/LikertScale";

var surveyQuestionData = [];
var surveyRespondentQuestionData = [];

const SurveyShareByEmail = () => {
    const { id } = useParams();
    const [copiedText, setCopiedText] = useState();
    const [modal, setModal] = useState(false);
    const toggle = () => setModal(!modal);

    const [surveyDe, setSurveyDe] = useState([]);
    const [isDisabled, setIsDisabled] = useState(false);

    const [name, setName] = useState("")
    const [recipientEmail, setRecipientEmail] = useState('');

    const [users, setUsers] = useState([{ respondentName: '', respondentEmail: '', category: '' }]);
    const [subject, setSubject] = useState("")
    const [message, setMessage] = useState("")
    const [respondentSubject, setRespondentSubject] = useState("")
    const [respondentMessage, setRespondentMessage] = useState("")

    const [Categories, setCategories] = useState([]);
    const [EmailTemplates, setEmailTemplates] = useState([]);
    const [SingleEmailTemplates, setSingleEmailTemplates] = useState([]);
    const [chooseEmailTemplate, setchooseEmailTemplate] = useState("");
    const [respondentChooseEmailTemplate, setchooseRespondentEmailTemplate] = useState("");

    const [data, setData] = useState(null);
    const [fileJsonData, setFileJsonData] = useState([])

    const [btnActive, setBtnActive] = useState(false);

    const handleInputChange = (index, event) => {
        const { name, value } = event.target || event; // Handle both regular input and select input
        const newUsers = [...users];
        newUsers[index][name] = value;
        setUsers(newUsers);
    };

    const handleAddUser = () => {
        setUsers([...users, { respondentName: '', respondentEmail: '', category: '' }]);
    };

    const handleSubmit = (event) => {
        event.preventDefault();
        // Handle form submission logic here
        console.log(users);

        users.map((respondentData, index) => {
            const surveyShareData = { surveyId: id, name: respondentData.respondentName, email: respondentData.respondentEmail, category: respondentData.category, subject: respondentSubject, message: respondentMessage };

            console.log(surveyShareData);

            axios.post('http://localhost:5454/api/v1/share-survey-respondent-by-email', surveyShareData)
                .then(res => {
                    toast.success('Email sent successfully!');
                }).catch(error => {
                    toast.warn('Failed to send email');
                })
        })
    };


    const handleSendEmail = (e) => {
        e.preventDefault();

        surveyDe.map(el => {
            el.questions.map(item => {
                let questionIdData = { questionId: item, answer: "" }
                surveyQuestionData.push(questionIdData)
            })
        })

        const surveyShareData = { surveyId: id, subject: { subjectName: name.trim(), subjectEmail: recipientEmail.trim(), responses: surveyQuestionData, isFilled: true } };
        console.log(surveyShareData);

        axios.put('http://localhost:5454/api/v1/survey-responses/subject', surveyShareData)
            .then(res => {
                toast.success('Subject Data Stored successfully!');
                setIsDisabled(true);

                // console.log("Subject Id = ", res.data.subject._id)

                const emailData = { surveyId: id, subjectName: name.trim(), subjectEmail: recipientEmail.trim(), subject: subject.trim(), message: message.trim(), subjectId: res.data.subject._id }

                axios.post('http://localhost:5454/api/v1/share-survey-by-email', emailData)
                    .then(res => {
                        toast.success('Email sent successfully!');
                    }).catch(error => {
                        toast.warn('Failed to send email');
                    })
            }).catch(error => {
                toast.warn('Failed to Stored Subject Data');
            })


    };

    // Fetch Category Data
    useEffect(() => {

        getCategory();
        getEmailTemplate();

        const fetchSurveyData = async () => {
            const surveyResponse = await axios.get(`http://localhost:5454/api/v1/survey?id=${id}`);
            setSurveyDe(surveyResponse.data)
        }

        fetchSurveyData();


    }, [id]);

    const getCategory = () => {
        axios.get('http://localhost:5454/api/v1/categoryRoles/')
            .then(res => {
                setCategories(res.data);
            })
            .catch(err => console.log(err));
    }

    const getEmailTemplate = () => {
        axios.get('http://localhost:5454/api/v1/emailTemplate/')
            .then(res => {
                setEmailTemplates(res.data);
            })
            .catch(err => console.log(err));
    }

    const handleSubjectSelectedEmailTemplate = (option) => {
        setchooseEmailTemplate(option);

        axios.get(`http://localhost:5454/api/v1/emailTemplate?id=${option.value}`)
            .then(res => {
                setSingleEmailTemplates(res.data);
            })
            .catch(err => console.log(err));

        setSubject(SingleEmailTemplates.templateSubject)
        setMessage(SingleEmailTemplates.templateMessage)
    }

    const handleRespondentSelectedEmailTemplate = (option) => {
        setchooseRespondentEmailTemplate(option);

        axios.get(`http://localhost:5454/api/v1/emailTemplate?id=${option.value}`)
            .then(res => {
                setSingleEmailTemplates(res.data);
            })
            .catch(err => console.log(err));

        setRespondentSubject(SingleEmailTemplates.templateSubject)
        setRespondentMessage(SingleEmailTemplates.templateMessage)
    }

    const usedCategoryIds = surveyDe.flatMap(survey => survey.categories);
    const filteredCategories = Categories.filter(category =>
        usedCategoryIds.includes(category._id)
    );

    const options = filteredCategories.map(category => ({
        value: category._id,
        label: category.categoryName
    }));

    const subjectEmailTemplateOptions = EmailTemplates.filter(el => el.templateForSubject === true)?.map(template => ({
        value: template._id,
        label: template.templateName
    }));

    const respondentEmailTemplateOptions = EmailTemplates.filter(el => el.templateForSubject === false)?.map(template => ({
        value: template._id,
        label: template.templateName
    }));


    const handleFileRespondentUpload = (e) => {
        const file = e.target.files[0];
        const reader = new FileReader();

        reader.onload = (event) => {
            const workbook = XLSX.read(event.target.result, { type: 'binary' });
            const sheetName = workbook.SheetNames[0];
            const sheet = workbook.Sheets[sheetName];
            const sheetData = XLSX.utils.sheet_to_json(sheet);

            setData(sheetData);
            setFileJsonData(sheetData)
            setUsers(sheetData)
            setBtnActive(true)

        };

        reader.readAsBinaryString(file);
    };

    // Step 1: Create a mapping of trait names to their respective _id values
    const categoryMapping = filteredCategories.reduce((map, category) => {
        const trimmedCategoryName = category.categoryName.trim();
        map[trimmedCategoryName] = category._id;
        return map;
    }, {});

    // Step 2: Replace the trait value in each question object with the corresponding _id and add a question code
    const updatedUsers = fileJsonData.map((respondent, index) => {
        const trimmedCategory = respondent.category.trim();
        return {
            ...respondent,
            category: categoryMapping[trimmedCategory],
        };
    });


    const handleFileRespondentSubmit = (e) => {
        e.preventDefault();
        console.log("Filtered Categories = ", filteredCategories);
        console.log("File Data ", data);
        console.log("JSON Data", fileJsonData);
        console.log("Fetched Data", updatedUsers);
        // setUsers(updatedUsers);
        console.log("Users = ", users);

        surveyDe.map(el => {
            el.questions.map(item => {
                let questionIdData = { questionId: item, answer: "" }
                surveyRespondentQuestionData.push(questionIdData)
            })
        })

        updatedUsers.map(el => {
            el.responses = surveyRespondentQuestionData
        })

        console.log("Fetched Data", updatedUsers);

        const addRespondentsData = { surveyId: id, respondents: updatedUsers }

        axios.put('http://localhost:5454/api/v1/survey-responses/respondents', addRespondentsData)
            .then(res => {
                toast.success('Respondents Data Stored successfully!');
                console.log(res.data);
                res.data.respondent.map(respondentItem => {
                    const surveyShareData = { surveyId: id, respondentId: respondentItem._id, name: respondentItem.respondentItem, email: respondentItem.respondentEmail, subject: respondentSubject, message: respondentMessage };

                    console.log(surveyShareData);
                    axios.post('http://localhost:5454/api/v1/share-survey-respondent-by-email', surveyShareData)
                        .then(res => {
                            toast.success('Email sent successfully to ' + respondentItem.name + '!');
                        }).catch(error => {
                            toast.warn('Failed to send email');
                        })
                })
            }).catch(error => {
                toast.warn('Failed to Store Respondents Data!');
            })

        // updatedUsers.map((respondentData, index)=>{
        // const surveyShareData = { surveyId: id, name: respondentData.name, email: respondentData.email, category: respondentData.category, subject: respondentSubject, message: respondentMessage };

        // console.log(surveyShareData);

        // axios.post('http://localhost:5454/api/v1/share-survey-respondent-by-email',surveyShareData )
        // .then(res =>{
        //     toast.success('Email sent successfully to '+respondentData.name+ '!');
        // }).catch (error => {
        //     toast.warn('Failed to send email');
        // })
        // })

    }


    return (
        <>
            <Header />
            {/* Page content */}
            <Container className="mt--7" fluid>
                <Row className="mt--3">
                    <div className="col">
                        <Card className="shadow">
                            <CardHeader className="bg-transparent d-flex justify-content-between align-items-center">
                                <h3 className="mb-0 fw-bold">Share Survey By Email</h3>
                            </CardHeader>
                        </Card>
                        <Card className="mt-3 shadow">
                            <CardHeader className="bg-transparent d-flex justify-content-between align-items-center">
                                <h3 className="">For Subject</h3>
                            </CardHeader>
                            <CardBody>
                                <form onSubmit={handleSendEmail}>
                                    <label className='form-label'>Subject Name</label>
                                    <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder='Enter Name' className='form-control' />

                                    <label className='form-label'>Subject's Email Address</label>
                                    <input type="email" value={recipientEmail} onChange={e => setRecipientEmail(e.target.value)} placeholder='Enter Recipient Email Address' className='form-control' />

                                    <div className="row">
                                        <div className="col-12">
                                            <label className='form-label'>Choose an Email Template</label>
                                            <Select options={subjectEmailTemplateOptions} value={chooseEmailTemplate} onChange={(option) => { handleSubjectSelectedEmailTemplate(option) }} />
                                        </div>
                                        {
                                            chooseEmailTemplate !== "" ? <>
                                                <div className="col-12">
                                                    <label className='form-label'>Email's Subject of Respondent</label>
                                                    <input className='form-control' type="text" name="subject" placeholder="Respondent Email's Subject" value={subject} onChange={(e) => setSubject(e.target.value)} />
                                                </div>
                                                <div className="col-12">
                                                    <label className='form-label'>Message for Respondent</label>
                                                    <TextareaAutosize className='form-control' minRows="5" maxRows="10" name="message" placeholder="Message for Respondent" value={message} onChange={(e) => setMessage(e.target.value)}></TextareaAutosize>
                                                </div>
                                            </> : <></>
                                        }
                                    </div>

                                    <button onClick={handleSendEmail} className='btn btn-primary my-2' disabled={isDisabled}>Send Invitation</button>
                                </form>
                            </CardBody>
                        </Card>
                        <Card className="mt-3">
                            {!btnActive ?
                                <>
                                    <CardHeader className="d-flex justify-content-between align-items-center">
                                        <h3 className="">For Respondents</h3>
                                        {!btnActive ? <button className="btn btn-primary" onClick={() => setBtnActive(true)}>Upload Respondents</button> : <></>}
                                    </CardHeader>
                                    <CardBody>
                                        <form onSubmit={handleSubmit}>
                                            {users.map((user, index) => (
                                                <div key={index} className='col-12'>
                                                    <h4 className='mt-3'>Respondent {index + 1}</h4>
                                                    <div className="row">
                                                        <div className="col-3">
                                                            {/* <label className='form-label'>Name</label> */}
                                                            <input className='form-control' type="text" name="name" placeholder="Respondent Name" value={user.respondentName} onChange={(e) => handleInputChange(index, e.target.value)} />
                                                        </div>
                                                        <div className="col-3">
                                                            {/* <label className='form-label'>Email Address</label> */}
                                                            <input className='form-control' type="email" name="email" placeholder="Respondent Email Address" value={user.respondentEmail} onChange={(e) => handleInputChange(index, e.target.value)} />
                                                        </div>
                                                        <div className="col-3">
                                                            {/* <label className='form-label'>Category</label> */}
                                                            <Select options={options} value={options.find(option => option.value === user.category) || user.category} onChange={(option) => handleInputChange(index, { target: { name: 'category', value: option.value } })} />
                                                        </div>
                                                        <div className="col">
                                                            <button className='btn btn-info' type="button" onClick={handleAddUser}>Add Another Respondent</button>
                                                        </div>
                                                    </div>

                                                    {/* <hr className='my-3' /> */}
                                                </div>
                                            ))}

                                            <div className="row mt-4">
                                                <div className="col-9">
                                                    <label className='form-label'>Choose an Email Template</label>
                                                    <Select options={respondentEmailTemplateOptions} value={respondentChooseEmailTemplate} onChange={(option) => { handleRespondentSelectedEmailTemplate(option) }} />
                                                </div>
                                                {
                                                    respondentChooseEmailTemplate !== "" ? <>
                                                        <div className="col-9">
                                                            <label className='form-label'>Email's Subject of Respondent</label>
                                                            <input className='form-control' type="text" name="subject" placeholder="Respondent Email's Subject" value={respondentSubject} onChange={(e) => setRespondentSubject(e.target.value)} />
                                                        </div>
                                                        <div className="col-9">
                                                            <label className='form-label'>Message for Respondent</label>
                                                            <TextareaAutosize className='form-control' minRows="5" maxRows="10" name="message" placeholder="Message for Respondent" value={respondentMessage} onChange={(e) => setRespondentMessage(e.target.value)}></TextareaAutosize>
                                                        </div>
                                                    </> : <></>
                                                }
                                            </div>

                                            <div className="row">
                                                <div className="col-9 text-center">
                                                    <button className='btn btn-primary my-2 px-5' type="submit">Send Email</button>
                                                </div>
                                            </div>
                                        </form>
                                    </CardBody></> : <></>
                            }
                        </Card>

                        <Card className="mt-3">
                            {btnActive ?
                                <>
                                    <CardHeader className="d-flex justify-content-between align-items-center">
                                        <h3 className="" >Upload Respondents</h3>
                                        {btnActive ? <Button className="btn btn-primary" onClick={() => setBtnActive(false)}>Go Back to Respondents</Button> : <></>}
                                    </CardHeader>
                                    <CardBody>
                                        <form onSubmit={handleFileRespondentSubmit}>
                                            <input type="file" onChange={handleFileRespondentUpload} />
                                            {/* <button type='submit'>Upload Fetched Data</button> */}

                                            {/* {data && (
                                                <div>
                                                    <h2>Imported Data:</h2>
                                                    <pre>{JSON.stringify(data, null, 2)}</pre>
                                                </div>
                                            )} */}
                                            {btnActive ? updatedUsers.map((user, index) => (
                                                <div key={index} className='col-12'>
                                                    <h4 className='mt-3'>Respondent {index + 1}</h4>
                                                    <div className="row">
                                                        <div className="col-3">
                                                            {/* <label className='form-label'>Name</label> */}
                                                            <input className='form-control' type="text" name="name" placeholder="Respondent Name" value={user.respondentName} onChange={(e) => handleInputChange(index, e.target.value)} />
                                                        </div>
                                                        <div className="col-3">
                                                            {/* <label className='form-label'>Email Address</label> */}
                                                            <input className='form-control' type="email" name="email" placeholder="Respondent Email Address" value={user.respondentEmail} onChange={(e) => handleInputChange(index, e.target.value)} />
                                                        </div>
                                                        <div className="col-3">
                                                            {/* <label className='form-label'>Category</label> */}
                                                            <Select options={options} value={options.find(option => option.value === user.category)} onChange={(option) => handleInputChange(index, { target: { name: 'category', value: option.value } })} />
                                                        </div>
                                                    </div>

                                                    {/* <hr className='my-3' /> */}
                                                </div>
                                            )) : <></>}

                                            {btnActive ? <>
                                                <div className="row mt-4">
                                                    <div className="col-9">
                                                        <label className='form-label'>Choose an Email Template</label>
                                                        <Select options={respondentEmailTemplateOptions} value={respondentChooseEmailTemplate} onChange={(option) => { handleRespondentSelectedEmailTemplate(option) }} />
                                                    </div>
                                                    {
                                                        respondentChooseEmailTemplate !== "" ? <>
                                                            <div className="col-9">
                                                                <label className='form-label'>Email's Subject of Respondent</label>
                                                                <input className='form-control' type="text" name="subject" placeholder="Respondent Email's Subject" value={respondentSubject} onChange={(e) => setRespondentSubject(e.target.value)} />
                                                            </div>
                                                            <div className="col-9">
                                                                <label className='form-label'>Message for Respondent</label>
                                                                <TextareaAutosize className='form-control' minRows="5" maxRows="10" name="message" placeholder="Message for Respondent" value={respondentMessage} onChange={(e) => setRespondentMessage(e.target.value)}></TextareaAutosize>
                                                            </div>
                                                        </> : <></>
                                                    }
                                                </div>

                                                <div className="row">
                                                    <div className="col-9 text-center">
                                                        <button className='btn btn-primary my-2 px-5' type="submit">Send Email to Respondents</button>
                                                    </div>
                                                </div>
                                            </> : <></>}
                                        </form>
                                    </CardBody></> : <></>
                            }
                        </Card>
                    </div>
                </Row>
            </Container>
        </>
    );
};

export default SurveyShareByEmail;
