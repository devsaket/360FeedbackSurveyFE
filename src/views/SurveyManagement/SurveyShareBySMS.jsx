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

var surveyQuestionData = [];
var surveyRespondentQuestionData = [];

const SurveyShareBySMS = () => {
    const { id } = useParams();
    const [copiedText, setCopiedText] = useState();
    const [modal, setModal] = useState(false);
    const toggle = () => setModal(!modal);

    const [surveyDe, setSurveyDe] = useState([]);
    const [isDisabled, setIsDisabled] = useState(false);

    const [name, setName] = useState("")
    const [recipientEmail, setRecipientEmail] = useState('');
    const [respondentName, setRespondentName] = useState("");
    const [respondentEmail, setRespondentEmail] = useState("");

    // const [users, setUsers] = useState([{ respondentName: '', respondentEmail: '', category: '' }]);
    const [users, setUsers] = useState([]);
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
    const [respondentsData, setRespondentsData] = useState({});
    const [receivedRespondentsData, setReceivedRespondentsData] = useState([]);
    const [subjectId, setSubjectId] = useState([]);

    // Fetch Category Data
    useEffect(() => {
        getCategory();
        getEmailTemplate();
    
        const fetchSurveyData = async () => {
            const surveyResponse = await axios.get(process.env.REACT_APP_BACKEND_URL + `/survey?id=${id}`);
            setSurveyDe(surveyResponse.data)
            initializeRespondents(surveyResponse.data);
        }
    
        fetchSurveyData();
    }, [id]);

    const initializeRespondents = (surveyData) => {
        const initialRespondents = {};
        surveyData.forEach(survey => {
            survey.categories.forEach(category => {
                initialRespondents[category.category] = Array(category.maxRespondents).fill({
                    respondentName: '',
                    respondentEmail: '',
                    responses: Array.isArray(survey.questions) && survey.questions.map(question => ({ questionId: question, answer: "" })),
                    isFilled: false
                });
            });
        });
        setRespondentsData(initialRespondents);
    };

    const getCategory = () => {
        axios.get(process.env.REACT_APP_BACKEND_URL + '/categoryRoles/')
            .then(res => {
                setCategories(res.data);
            })
            .catch(err => console.log(err));
    }

    const getEmailTemplate = () => {
        axios.get(process.env.REACT_APP_BACKEND_URL + '/emailTemplate/')
            .then(res => {
                setEmailTemplates(res.data);
            })
            .catch(err => console.log(err));
    }

    const handleInputChange = (category, index, field, value) => {
        setRespondentsData(prevState => {
            const updatedCategory = [...prevState[category]];
            updatedCategory[index] = { ...updatedCategory[index], [field]: value };
            return { ...prevState, [category]: updatedCategory };
        });
    };

    const handleAddUser = (category) => {
        setRespondentsData(prevState => {
            if (prevState[category].length < surveyDe[0].categories.find(cat => cat.category === category).maxRespondents) {
                const newRespondent = {
                    respondentName: '',
                    respondentEmail: '',
                    responses: Array.isArray(surveyDe[0].questions) && surveyDe[0].questions.map(question => ({ questionId: question, answer: "" })),
                    isFilled: false
                };
                return { ...prevState, [category]: [...prevState[category], newRespondent] };
            } else {
                toast.warn(`Maximum respondents for category ${category} reached.`);
                return prevState;
            }
        });
    };

    // const handleInputChange = (index, event) => {
    //     const { name, value } = event.target || event; // Handle both regular input and select input
    //     const newUsers = [...users];
    //     newUsers[index][name] = value;
    //     setUsers(newUsers);
    // };

    // const handleAddUser = (categoryIndex) => {
    //     // const newUsers = [...users];
    //     const category = surveyDe[0].categories[categoryIndex];

    //     const categoryRespondents = users.filter(user => user.category === category.category);
    //     if (categoryRespondents.length < category.maxRespondents) {
    //         setUsers([...users,{ respondentName: '', respondentEmail: '', category: category.category }]);
    //         // setUsers([...users,{ respondentName: '', respondentEmail: '', category: categoryIndex }]);
    //         // setUsers(newUsers);
    //     } else {
    //         toast.warn(`Maximum respondents for category ${category.category} reached.`);
    //     }
    // };

    const handleSubmit = (event) => {
        event.preventDefault();

        console.log(respondentsData);
        // Handle form submission logic here
        users.push(Object.entries(respondentsData) // Convert object to array of [key, value] pairs
            .flatMap(([category, users]) => // For each [subject, users] pair, map users to new format
            Array.isArray(users) && users.map(user => ({ ...user, category })) // Spread user object and add subject
        ));

        console.log(users);
        
        Array.isArray(users) && users.map((respondentData, index) => {
            const respondentsArrayData = {surveyId: id, subjectId: subjectId, respondent: respondentData};
            console.log(respondentsArrayData);
            
            axios.post(process.env.REACT_APP_BACKEND_URL + '/survey-responses/add-respondent', respondentsArrayData)
            .then(res => {
                toast.success('Respondent Data Stored successfully!');
                setIsDisabled(true);
                console.log(res.data);

                Array.isArray(res.data.subject.respondent) && res.data.subject.respondent.map((resdata)=>{
                    const resEmailData = {surveyId: id,subjectId: res.data.subjectId, respondentId: resdata._id, name:resdata.respondentName, phone: resdata.respondentEmail, subject: respondentSubject, message: respondentMessage }
                    console.log(resEmailData);

                    axios.post(process.env.REACT_APP_BACKEND_URL + '/share-survey-respondent-by-sms', resEmailData)
                    .then(res => {
                        toast.success(`SMS sent successfully to ${resEmailData.respondentName} !`);
                    }).catch(error => {
                        toast.warn('Failed to send SMS');
                    })
                })
            })
            .catch(error => {
                toast.warn('Failed to store Respondent Data');
                console.log(error)
            })
        })

        // const respondentsArrayData = {surveyId: id, respondents: users};
        // console.log(respondentsArrayData);
        
        // axios.put(process.env.REACT_APP_BACKEND_URL + '/survey-responses/respondents', respondentsArrayData)
        // .then(res => {
        //     toast.success('Subject Data Stored successfully!');
        //     setIsDisabled(true);
        //     console.log(respondentsArrayData);
                        
        //     users.map((respondentData, index) => {
        //         const surveyShareData = { surveyId: id, name: respondentData.respondentName, email: respondentData.respondentEmail, category: respondentData.category };

        //         axios.post(process.env.REACT_APP_BACKEND_URL + '/share-survey-respondent-by-sms', surveyShareData)
        //         .then(res => {
        //             toast.success('Email sent successfully!');
        //         }).catch(error => {
        //             toast.warn('Failed to send email');
        //         })

        //     })
        // })
        // .catch(error => {
        //     toast.warn('Failed to send email');
        // })
            
    };


    const handleSendSMS = (e) => {
        e.preventDefault();
        Array.isArray(surveyDe) && surveyDe.map(el => {
            Array.isArray(el.questions) && el.questions.map(item => {
                let questionIdData = { questionId: item, answer: "" }
                surveyQuestionData.push(questionIdData)
            })
        })

        const surveyShareData = { surveyId: id, subject: { subjectName: name.trim(), subjectPhone: recipientEmail.trim(), responses: surveyQuestionData, isFilled: false } };

        axios.post(process.env.REACT_APP_BACKEND_URL + '/survey-responses/add-subject', surveyShareData)
            .then(res => {
                toast.success('Subject Data Stored successfully!');
                setSubjectId(res.data.subjectId)
                setIsDisabled(true);

                const smsData = { surveyId: id, subjectName: name.trim(), subjectPhone: recipientEmail.trim(), subject: subject.trim(), message: message.trim(), subjectId: res.data.subjectId }

                axios.post(process.env.REACT_APP_BACKEND_URL + '/share-survey-by-sms', smsData)
                    .then(res => {
                        toast.success('SMS sent successfully!');
                    }).catch(error => {
                        toast.warn('Failed to send SMS');
                    })
            }).catch(error => {
                toast.warn('Failed to Stored Subject Data');
            })
    };

    const handleSubjectSelectedEmailTemplate = (option) => {
        setchooseEmailTemplate(option);

        axios.get(process.env.REACT_APP_BACKEND_URL + `/emailTemplate?id=${option.value}`)
            .then(res => {
                setSingleEmailTemplates(res.data);
            })
            .catch(err => console.log(err));

        setSubject(SingleEmailTemplates.templateSubject)
        setMessage(SingleEmailTemplates.templateMessage)
    }

    const handleRespondentSelectedEmailTemplate = (option) => {
        setchooseRespondentEmailTemplate(option);

        axios.get(process.env.REACT_APP_BACKEND_URL + `/emailTemplate?id=${option.value}`)
            .then(res => {
                setSingleEmailTemplates(res.data);
            })
            .catch(err => console.log(err));

        setRespondentSubject(SingleEmailTemplates.templateSubject)
        setRespondentMessage(SingleEmailTemplates.templateMessage)
    }

    const usedCategoryIds = Array.isArray(surveyDe) && surveyDe.flatMap(survey => Array.isArray(survey.categories) && survey.categories.map(category => category.category));
    const filteredCategories = Array.isArray(Categories) && Categories.filter(category => usedCategoryIds.includes(category._id));
    const options = Array.isArray(filteredCategories) && filteredCategories.map(category => ({
        value: category._id,
        label: category.categoryName
    }));

    const subjectEmailTemplateOptions = Array.isArray(EmailTemplates) && EmailTemplates.filter(el => el.templateForSubject === true)?.map(template => ({
        value: template._id,
        label: template.templateName
    }));

    const respondentEmailTemplateOptions = Array.isArray(EmailTemplates) && EmailTemplates.filter(el => el.templateForSubject === false)?.map(template => ({
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
    const categoryMapping = Array.isArray(filteredCategories) && filteredCategories.reduce((map, category) => {
        const trimmedCategoryName = category.categoryName.trim();
        map[trimmedCategoryName] = category._id;
        return map;
    }, {});

    // Step 2: Replace the trait value in each question object with the corresponding _id and add a question code
    const updatedUsers = Array.isArray(fileJsonData) && fileJsonData.map((respondent, index) => {
        const trimmedCategory = respondent.category.trim();
        return {
            ...respondent,
            category: categoryMapping[trimmedCategory],
        };
    });


    const handleFileRespondentSubmit = (e) => {
        e.preventDefault();
        Array.isArray(surveyDe) && surveyDe.map(el => {
            Array.isArray(el.questions) && el.questions.map(item => {
                let questionIdData = { questionId: item, answer: "" }
                surveyRespondentQuestionData.push(questionIdData)
            })
        })

        const updatedUsers = Array.isArray(fileJsonData) && fileJsonData.map((respondent, index) => {
            return {
                ...respondent,
                responses: surveyRespondentQuestionData
            };
        });

        const addRespondentsData = { surveyId: id, respondents: updatedUsers };

        axios.put(process.env.REACT_APP_BACKEND_URL + '/survey-responses/respondents', addRespondentsData)
            .then(res => {
                toast.success('Respondents Data Stored successfully!');
                Array.isArray(res.data.respondent) && res.data.respondent.map(respondentItem => {
                    const surveyShareData = { surveyId: id, respondentId: respondentItem._id, name: respondentItem.respondentName, phone: respondentItem.respondentEmail, subject: respondentSubject, message: respondentMessage };
                    axios.post(process.env.REACT_APP_BACKEND_URL + '/share-survey-respondent-by-sms', surveyShareData)
                        .then(res => {
                            toast.success('SMS sent successfully to ' + respondentItem.respondentName + '!');
                        }).catch(error => {
                            toast.warn('Failed to send SMS');
                        })
                })
            }).catch(error => {
                toast.warn('Failed to Store Respondents Data!');
            })
    };


    return (
        <>
            <Header />
            {/* Page content */}
            <Container className="mt--7" fluid>
                <Row className="mt--3">
                    <div className="col">
                        <Card className="shadow">
                            <CardHeader className="bg-transparent d-flex justify-content-between align-items-center">
                                <h3 className="mb-0 fw-bold">Share Survey By SMS</h3>
                            </CardHeader>
                        </Card>
                        <Card className="mt-3 shadow">
                            <CardHeader className="bg-transparent d-flex justify-content-between align-items-center">
                                <h3 className="">For Subject</h3>
                            </CardHeader>
                            <CardBody>
                                <form onSubmit={handleSendSMS}>
                                    <label className='form-label'>Subject Name</label>
                                    <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder='Enter Name' className='form-control' />

                                    <label className='form-label'>Subject's Phone Number</label>
                                    <input type="text" value={recipientEmail} onChange={e => setRecipientEmail(e.target.value)} placeholder='Enter Recipient Phone Number' className='form-control' />

                                    <div className="row">
                                        <div className="col-12">
                                            <label className='form-label'>Choose an SMS Template</label>
                                            <Select
                                        value={subjectEmailTemplateOptions.find(option => option.value === chooseEmailTemplate)}
                                        onChange={e => {
                                            setchooseEmailTemplate(e.value);
                                            const selectedTemplate = EmailTemplates.find(template => template._id === e.value);
                                            if (selectedTemplate) {
                                                setSubject(selectedTemplate.templateSubject);
                                                setMessage(selectedTemplate.templateMessage);
                                            }
                                        }}
                                        options={subjectEmailTemplateOptions}
                                        placeholder="Select SMS Template"
                                        isClearable
                                        isSearchable
                                    />
                                        </div>
                                        {
                                            chooseEmailTemplate !== "" ? <>
                                                <div className="col-12">
                                                    <label className='form-label'>SMS's Subject of Respondent</label>
                                                    <input className='form-control' type="text" name="subject" placeholder="Respondent SMS's Subject" value={subject} onChange={(e) => setSubject(e.target.value)} />
                                                </div>
                                                <div className="col-12">
                                                    <label className='form-label'>Message for Respondent</label>
                                                    <TextareaAutosize className='form-control' minRows="5" maxRows="10" name="message" placeholder="Message for Respondent" value={message} onChange={(e) => setMessage(e.target.value)}></TextareaAutosize>
                                                </div>
                                            </> : <></>
                                        }
                                    </div>

                                    <button onClick={handleSendSMS} className='btn btn-primary my-2' disabled={isDisabled}>Send Invitation</button>
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
                                        {Array.isArray(surveyDe) && surveyDe[0]?.categories?.map((category, index) => (
                                        <div key={index} className="mt-4">
                                            <h5>{Array.isArray(Categories) && Categories.find(cat=> cat._id===category.category)?.categoryName} (Max: {category.maxRespondents})</h5>
                                            {respondentsData[category.category]?.map((respondent, index) => (
                                                <div key={index}>
                                                    <label>Respondent Name</label>
                                                    <input type="text" className="form-control" value={respondent.respondentName} onChange={e => handleInputChange(category.category, index, 'respondentName', e.target.value)} required />
                                                    <label>Respondent Phone No.</label>
                                                    <input type="text" className="form-control" value={respondent.respondentEmail} onChange={e => handleInputChange(category.category, index, 'respondentEmail', e.target.value)} required />
                                                </div>
                                            ))}
                                            {/* <Button color="success" onClick={() => handleAddUser(category.category)}>Add Respondent</Button> */}
                                        </div>
                                    ))}
                                    <label className='form-label mt-2'>Choose SMS Template</label>
                                    <Select
                                        value={respondentEmailTemplateOptions.find(option => option.value === respondentChooseEmailTemplate)}
                                        onChange={e => {
                                            setchooseRespondentEmailTemplate(e.value);
                                            const selectedTemplate = EmailTemplates.find(template => template._id === e.value);
                                            if (selectedTemplate) {
                                                setRespondentSubject(selectedTemplate.templateSubject);
                                                setRespondentMessage(selectedTemplate.templateMessage);
                                            }
                                        }}
                                        options={respondentEmailTemplateOptions}
                                        placeholder="Select SMS Template"
                                        isClearable
                                        isSearchable
                                    />
                                    <label className='form-label mt-2'>SMS Subject</label>
                                    <TextareaAutosize className="form-control" minRows={3} value={respondentSubject} onChange={e => setRespondentSubject(e.target.value)} placeholder='Enter SMS Subject' required />
                                    <label className='form-label mt-2'>SMS Message</label>
                                    <TextareaAutosize className="form-control" minRows={5} value={respondentMessage} onChange={e => setRespondentMessage(e.target.value)} placeholder='Enter SMS Message' required />
                                    <Button type='submit' color="primary" className="mt-4">Send SMS</Button>
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
                                            {btnActive ? Array.isArray(updatedUsers) && updatedUsers.map((user, index) => (
                                                <div key={index} className='col-12'>
                                                    <h4 className='mt-3'>Respondent {index + 1}</h4>
                                                    <div className="row">
                                                        <div className="col-3">
                                                            {/* <label className='form-label'>Name</label> */}
                                                            <input className='form-control' type="text" name="name" placeholder="Respondent Name" value={user.respondentName} onChange={(e) => handleInputChange(index, e.target.value)} />
                                                        </div>
                                                        <div className="col-3">
                                                            {/* <label className='form-label'>Email Address</label> */}
                                                            <input className='form-control' type="text" name="email" placeholder="Respondent Phone Number" value={user.respondentEmail} onChange={(e) => handleInputChange(index, e.target.value)} />
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
                                                        <label className='form-label'>Choose an SMS Template</label>
                                                        <Select options={respondentEmailTemplateOptions} value={respondentChooseEmailTemplate} onChange={(option) => { handleRespondentSelectedEmailTemplate(option) }} />
                                                    </div>
                                                    {
                                                        respondentChooseEmailTemplate !== "" ? <>
                                                            <div className="col-9">
                                                                <label className='form-label'>SMS's Subject for Respondent</label>
                                                                <input className='form-control' type="text" name="subject" placeholder="Respondent SMS's Subject" value={respondentSubject} onChange={(e) => setRespondentSubject(e.target.value)} />
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
                                                        <button className='btn btn-primary my-2 px-5' type="submit">Send SMS to Respondents</button>
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

export default SurveyShareBySMS;
