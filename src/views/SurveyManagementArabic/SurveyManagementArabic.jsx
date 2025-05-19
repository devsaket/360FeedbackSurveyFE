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
    import { useNavigate, Link } from 'react-router-dom';
    import axios from 'axios';

    import Popup from 'reactjs-popup';
    import 'reactjs-popup/dist/index.css';
    import { toast } from 'react-toastify';
    import 'react-toastify/dist/ReactToastify.css';
    import TextareaAutosize from 'react-textarea-autosize';

    // reactstrap components
    import {
        Card,
        CardHeader,
        CardBody,
        Container,
        Row, Modal, ModalHeader, ModalBody, ModalFooter, Button,
        Table
    } from "reactstrap";
    // core components
    import Header from "components/Headers/Header.js";
    import Select from "react-select";



    const SurveyManagementArabic = () => {
        const [modal, setModal] = useState(false);
        const toggle = () => setModal(!modal);
        const navigate = useNavigate();

        // const [updateMode, setUpdateMode] = useState(false);

        const [questions, setQuestions] = useState([]);
        const [traits, setTraits] = useState([]);
        const [Categories, setCategories] = useState([]);
        const [surveyTraits, setSurveyTraits] = useState([]);
        const [selectedQuestions, setSelectedQuestions] = useState([]);
        const [selectedTrait, setSelectedTrait] = useState([]);
        const [surveyName, setSurveyName] = useState('');
        const [surveyDescription, setSurveyDescription] = useState('');
        // const [surveyCategories, setSurveyCategories] = useState([]);

        const [subject, setSubject] = useState({ subjectName: '', subjectEmail: '', responses: [], isFilled: false, respondent:[] });

        const [surveys, setSurveys] = useState([]);

        // const [categoriesOptions, setCategoriesOptions] = useState([]);
        const [selectedCategories, setSelectedCategories] = useState([]);
        const [categoryDetails, setCategoryDetails] = useState({});

        const [totalWeightage, setTotalWeightage] = useState(0); // Added for tracking total weightage
        const [weightageError, setWeightageError] = useState(''); // For displaying error message
    

        const handleDeleteSurvey = (id) => {
            // Send delete request to backend
            axios.delete(process.env.REACT_APP_BACKEND_URL + `/survey/${id}`)
                .then(response => {
                    console.log('Survey deleted successfully:', response.data.message);
                    // Remove the deleted survey from state
                    setSurveys(surveys.filter(survey => survey._id !== id));
                })
                .catch(error => {
                    console.error('Error deleting survey:', error);
                });
        };

        useEffect(() => {
            // Fetch traits from the backend
            getTraits();
            // Fetch questions from the backend
            getQuestions();

            // Fetch Categories from the Backend
            getCategories();

            //fetch surveys from the Backend
            getSurveys();
        }, []);

        const getSurveys = () =>{
            // Fetch surveys from the backend
            axios.get(process.env.REACT_APP_BACKEND_URL + '/survey')
                .then(response => {
                    setSurveys(response.data);
                })
                .catch(error => {
                    console.error('Error fetching surveys:', error);
                });
        }

        const getQuestions = () => {
            axios.get(process.env.REACT_APP_BACKEND_URL + '/question')
                .then(response => {
                    setQuestions(response.data);
                })
                .catch(error => {
                    console.error('Error fetching questions:', error);
                });
        }

        const getTraits = () => {
            axios.get(process.env.REACT_APP_BACKEND_URL + '/trait')
                .then(res => {
                    setTraits(res.data);
                })
                .catch(error => {
                    console.error('Error fetching questions:', error);
                });
        }

        const getCategories = () => {
            axios.get(process.env.REACT_APP_BACKEND_URL + '/categoryRoles')
                .then(res => {
                    setCategories(res.data);
                })
                .catch(error => {
                    console.error('Error fetching Categories:', error);
                });
        }

        const handleTraitChange = (selectedOption) => {
            getQuestions();
            setSelectedTrait(selectedOption);
            console.log('Selected Trait:', selectedOption);

            // setQuestions(questions.filter((el)=> el.trait._id === selectedOption.value))
        };

        const handleCategoriesChange = (selectedOption) => {
            setSelectedCategories(selectedOption);
        
            const updatedCategoryDetails = {};
            selectedOption.forEach(category => {
                updatedCategoryDetails[category.value] = categoryDetails[category.value] || { scoreWeightage: 0, maxRespondents: 0 };
            });
            setCategoryDetails(updatedCategoryDetails);
        };

        // const handleCategoryDetailChange = (categoryId, field, value) => {
        //     setCategoryDetails(prevDetails => ({
        //         ...prevDetails,
        //         [categoryId]: {
        //             ...prevDetails[categoryId],
        //             [field]: value
        //         }
        //     }));
        // };

        const handleCategoryDetailChange = (categoryId, field, value) => {
            setCategoryDetails(prevDetails => ({
                ...prevDetails,
                [categoryId]: {
                    ...prevDetails[categoryId],
                    [field]: value
                }
            }));
    
            if (field === 'scoreWeightage') {
                // Recalculate the total weightage when score weightage changes
                const updatedCategoryDetails = {
                    ...categoryDetails,
                    [categoryId]: {
                        ...categoryDetails[categoryId],
                        scoreWeightage: value
                    }
                };

                const total = Object.values(updatedCategoryDetails).reduce((sum, detail) => sum + detail.scoreWeightage, 0);
                setTotalWeightage(total);
    
                // Check if the total weightage exceeds 100
                if (total > 100) {
                    setWeightageError('Total score weightage cannot exceed 100.');
                } else if (total < 100) {
                    setWeightageError('Total score weightage must be exactly 100.');
                } else {
                    setWeightageError(''); // Clear the error if total weightage is 100
                }
            }
        };

        const options = Array.isArray(traits) && traits.map(trait => ({
            value: trait._id,
            label: trait.traitName
        }));

        const categoriesSelectOptions = Array.isArray(Categories) && Categories.map(category => ({
            value: category._id,
            label: category.categoryName
        }));


        // const handleQuestionSelect = (qid, selTrait) => {
        //     questions.append(qid)
        //     traits.append(selTrait)
        // }

        const handleCheckboxChange = (questionId) => {
            const index = selectedQuestions.indexOf(questionId);
            if (index === -1) {
                // If the question is not already selected, add it to the array
                setSelectedQuestions([...selectedQuestions, questionId]);
            } else {
                // If the question is already selected, remove it from the array
                const updatedQuestions = [...selectedQuestions];
                updatedQuestions.splice(index, 1);
                setSelectedQuestions(updatedQuestions);
            }

            console.log(selectedQuestions)

            // if(!surveyTraits.includes(selectedTrait.value)){
            //     setSurveyTraits([...surveyTraits, selectedTrait.value])
            // }


            Array.isArray(selectedTrait) && selectedTrait.map((traititem) => {
                if (!surveyTraits.includes(traititem.value)) {
                    surveyTraits.push(traititem.value)
                }
            })

        };


        const handleSubmit = (e) => {
            e.preventDefault();

            // selectedCategories.map((categoryItem) => {
            //     surveyCategories.push(categoryItem.value)
            // })

            // console.log(surveyCategories)

            if (totalWeightage !== 100) {
                setWeightageError('Total score weightage must equal 100.');
                toast.error('Total score weightage must equal 100.');
                return;
            }

            const surveyCategories = Array.isArray(selectedCategories) && selectedCategories.map(category => ({
                categoryId: category.value,
                scoreWeightage: categoryDetails[category.value].scoreWeightage,
                maxRespondents: categoryDetails[category.value].maxRespondents
            }));

            // Send selected questions and survey name to the backend to create the survey
            const surveyData = { surveyName, surveyDescription, traits: surveyTraits, categories: surveyCategories, questions: selectedQuestions, subject:[subject] };

            console.log(surveyData, selectedTrait);

            axios.post(process.env.REACT_APP_BACKEND_URL + '/survey', surveyData)
            .then(response => {
                console.log('Survey created successfully:', response.data.survey._id);
                toast.success("Survey created Successfully!");
                toggle();
                navigate(`/admin/survey-details/${response.data.survey._id}`, { replace: true });
                getSurveys();
                
            })
            .catch(error => {
                // console.error('Error creating survey:', error);
                toast.error("Error creating survey!");
            });
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
                                    {/* <h3 className="mb-0">All Surveys</h3> */}
                                    <h3 className="mb-0">جميع الاستبيانات</h3>
                                    {/* <Button onClick={toggle}><i className="fa-solid fa-plus me-2"></i> Add Survey</Button> */}
                                    <Button onClick={toggle}><i className="fa-solid fa-plus me-2"></i> إضافة استبيان</Button>
                                    <Modal isOpen={modal} toggle={toggle}   >
                                        <form onSubmit={handleSubmit}>
                                            <ModalHeader toggle={toggle} className="border border-bottom">
                                                {/* <h3 className="mb-0">Add Survey</h3> */}
                                                <h3 className="mb-0">إضافة استبيان</h3>
                                            </ModalHeader>
                                            <ModalBody>
                                                <label htmlFor="surveyName" className='form-label'>Survey Name</label>
                                                <input type="text" id="surveyName" value={surveyName} placeholder="Survey Name" onChange={(e) => setSurveyName(e.target.value)} className='form-control' />

                                                <label htmlFor="surveyDescription">Survey Description:</label><br />
                                                <TextareaAutosize id="surveyDescription" value={surveyDescription} placeholder="Survey Description" minRows={3} maxRows={5} onChange={(e) => setSurveyDescription(e.target.value)} className='form-control'></TextareaAutosize>

                                                <label htmlFor="surveyTrait" className='form-label'>Survey Trait:</label>
                                                <Select options={options} value={selectedTrait} onChange={handleTraitChange} isMulti={true} />

                                                {Array.isArray(selectedTrait) && selectedTrait?.map(dataitem => (
                                                    <>
                                                        <p>Select Questions for <b>{dataitem.label}</b>:</p>
                                                        <ul className="list-unstyled">
                                                            {Array.isArray(questions) && 
                                                                questions.filter((el) => el.trait._id === dataitem.value).length > 0 ?
                                                                    questions.filter((el) => el.trait._id === dataitem.value).map(question => (
                                                                        <li key={question._id} className="form-check">
                                                                            <input type="checkbox" id={question._id} checked={selectedQuestions.includes(question._id)} onChange={() => handleCheckboxChange(question._id)} className="form-check-input" />
                                                                            <label htmlFor={question._id} className="form-check-label">&nbsp; {question.question} </label>
                                                                        </li>
                                                                    )) :
                                                                    <>
                                                                        <li>No Question is available in this trait!</li>
                                                                    </>
                                                            }
                                                        </ul>
                                                    </>
                                                ))}

                                                <label htmlFor="surveyCategories" className='form-label'>Respondent Categories:</label>
                                                <Select options={categoriesSelectOptions} value={selectedCategories} onChange={handleCategoriesChange} isMulti={true} required />

                                                {Array.isArray(selectedCategories) && selectedCategories.map(category => (
                                                    <div key={category.value} className="mb-3">
                                                        <h5>{category.label}</h5>
                                                        <label htmlFor={`scoreWeightage-${category.value}`}>Score Weightage:</label>
                                                        <input type="number" id={`scoreWeightage-${category.value}`} value={categoryDetails[category.value]?.scoreWeightage || 0} onChange={(e) => handleCategoryDetailChange(category.value, 'scoreWeightage', parseInt(e.target.value))} className='form-control' required />

                                                        <label htmlFor={`maxRespondents-${category.value}`}>Maximum Respondents:</label>
                                                        <input type="number" id={`maxRespondents-${category.value}`} value={categoryDetails[category.value]?.maxRespondents || 0} onChange={(e) => handleCategoryDetailChange(category.value, 'maxRespondents', parseInt(e.target.value))} className='form-control' required />
                                                    </div>
                                                ))}

                                                {weightageError && <p className="text-danger">{weightageError}</p>}
                                                <p>Total Score Weightage: {totalWeightage}</p>

                                            </ModalBody>
                                            <ModalFooter>
                                                <Button color="primary" className='px-5 my-2' type="submit"> Submit </Button>

                                                <Button color="secondary" onClick={toggle}>
                                                    Cancel
                                                </Button>
                                            </ModalFooter>
                                        </form>
                                    </Modal>
                                </CardHeader>
                                <CardBody>
                                    <Table className="table-hover header-dash w-100">
                                        <thead>
                                            <tr className=''>
                                                <th scope="col" className='text-center align-text-top ps-2 bg-dark text-white' style={{ width: '8rem' }}>S.No</th>
                                                <th scope="col" className='text-start align-text-top ps-2 bg-dark text-white'>Survey Name</th>
                                                <th scope="col" className='text-start align-text-top ps-2 bg-dark text-white' style={{ maxWidth: '15rem' }}>Description</th>
                                                <th scope="col" className='text-center align-text-top ps-2 bg-dark text-white'>Created At</th>
                                                <th scope="col" className='text-center align-text-top ps-2 bg-dark text-white'></th>
                                                <th scope="col" className='text-center align-text-top ps-2 bg-dark text-white'></th>
                                            </tr>
                                        </thead>

                                        <tbody className=''>
                                            {Array.isArray(surveys) && surveys.map((el, index) => {
                                                return (
                                                    <>
                                                        <tr key={el._id}>
                                                            <td className='text-center ps-1 align-middle' style={{ width: '8rem' }}>{index + 1}</td>
                                                            <td className='text-start ps-1 align-middle'><Link to={`/admin/survey-details/${el._id}`}>{el.surveyName}</Link></td>
                                                            <td className='text-start ps-1 align-middle' style={{ maxWidth: '15rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{el.surveyDescription}</td>
                                                            <td className='text-center ps-1 align-middle'>{new Date(el.createdOn).toLocaleDateString()}</td>
                                                            <td className='text-center ps-1 '>
                                                                <Link to={`/admin/survey-details/${el._id}`}><i class="fa-solid fa-eye"></i></Link>
                                                                <Popup trigger={<button className=' p-2 bg-transparent border border-0'><i className="fa-solid fa-trash"></i></button>} position="top right">
                                                                    <div className='py-1 p-2'>Are you sure you want to delete <span className='text-danger fs-5 fw-bold'>{el.surveyName}</span>?</div>
                                                                    <button className='btn btn-danger my-3 py-1 mx-2' onClick={() => { handleDeleteSurvey(el._id) }}>Delete</button>
                                                                </Popup>
                                                            </td>
                                                            <td className='text-center ps-1 '>
                                                                <Link to={`/admin/survey-result/${el._id}`}><i class="fa-solid fa-square-poll-vertical"></i> Result</Link>
                                                                {/* <Link to={`/admin/survey/analysis/${el._id}`}><i class="fa-solid fa-square-poll-vertical"></i> Analysis</Link> */}

                                                            </td>
                                                        </tr>
                                                    </>
                                                )
                                            })
                                            }
                                        </tbody>
                                    </Table>
                                </CardBody>
                            </Card>
                        </div>
                    </Row>
                </Container>
            </>
        );
    };

    export default SurveyManagementArabic;
