import { useState, useEffect, useRef } from "react";
// react component that copies the given text inside your clipboard
import { CopyToClipboard } from "react-copy-to-clipboard";
import axios from 'axios';
import * as XLSX from 'xlsx';
import Popup from 'reactjs-popup';
import 'reactjs-popup/dist/index.css';
import { toast, ToastContainer } from 'react-toastify';
import { useForm } from "react-hook-form";
import { joiResolver } from "@hookform/resolvers/joi";
import Joi from "@hapi/joi";
import 'react-toastify/dist/ReactToastify.css';
import { Link, useParams } from 'react-router-dom';
import TextareaAutosize from 'react-textarea-autosize';
import FileSaver from 'file-saver';

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


const QuestionBankSchema = Joi.object({
    question: Joi.string().required(),
    questionOthers: Joi.string().required(),
    trait: Joi.string().required(),
});

const QuestionManagement = () => {
    const { traitId } = useParams();

    const [copiedText, setCopiedText] = useState();

    const [modal, setModal] = useState(false);
    const [uploadModal, setUploadModal] = useState(false);

    const [Trait, setTrait] = useState([]);
    const [Questions, setQuestions] = useState([]);

    const dropdownRef = useRef(null);

    const [btnActive, setBtnActive] = useState(true)
    const [updateMode, setUpdateMode] = useState(false);
    const [updateQuestion, setSelectedQuestion] = useState({});
    const [nextQuestionCode, setNextQuestionCode] = useState("");

    const [data, setData] = useState(null);
    const [fileJsonData, setFileJsonData] = useState([]);

    const toggle = () => {
        if (!modal) {
            // Fetch next question code
            axios.get(process.env.REACT_APP_BACKEND_URL + '/questions/next-code')
                .then(res => setNextQuestionCode(res.data.lastQuestion))
                .catch(err => console.log(err));
        }
        setModal(!modal);
    }
    const uploadToggle = () => setUploadModal(!uploadModal);

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors }
    } = useForm({
        resolver: joiResolver(QuestionBankSchema),
        defaultValues: {
            question: "",
            questionOthers: "",
            trait: "",
        }
    });

    useEffect(() => {
        axios.get(process.env.REACT_APP_BACKEND_URL + '/trait/')
            .then(res => {
                setTrait(res.data);
            })
            .catch(err => console.log(err));

        if (traitId) {
            axios.get(process.env.REACT_APP_BACKEND_URL + '/question/')
                .then(res => {
                    Array.isArray(res.data) && (res.data).filter(el => el.trait._id === traitId)
                    setQuestions(res.data)
                })
                .catch(err => console.log(err));
        } else {
            axios.get(process.env.REACT_APP_BACKEND_URL + '/question/')
                .then(res => {
                    setQuestions(res.data)
                })
                .catch(err => console.log(err));
        }
    }, [traitId]);

    const onSubmit = (data) => {
        if (updateMode) {
            const postData = { ...data, _id: updateQuestion._id }
            axios.put(process.env.REACT_APP_BACKEND_URL + `/question/${updateQuestion._id}`, postData)
                .then((res) => {
                    if (res.data.status) {
                        reset({ question: "", questionOthers: "", trait: "" });
                        toast.success(res.data.message);
                        toggle();
                        getQuestions();
                        setUpdateMode(false);
                        setSelectedQuestion({})
                    } else {
                        toast.warn(res.data.message);
                    }
                })
        } else {
            axios.post(process.env.REACT_APP_BACKEND_URL + '/question', data)
                .then((res) => {
                    if (res.status === 200) {
                        reset({ question: "", questionOthers: "", trait: "" });
                        toast.success("Question Inserted Successfully!");
                        toggle();
                        getQuestions();
                    } else {
                        toast.warn("Something Went Wrong!");
                        getQuestions();
                    }
                })
                .catch((err) => {
                    console.log(err?.message)
                    toast.warn("Duplicate Question Code");
                });
        }
    }

    const selectedQuestion = (data) => {
        setUpdateMode(true);
        reset({ question: data.question, questionOthers: data.questionOthers, trait: data.trait._id });
        setSelectedQuestion(data);
    };

    const getQuestions = () => {
        axios.get(process.env.REACT_APP_BACKEND_URL + '/question/')
            .then(res => {
                setQuestions(res.data);
            })
            .catch(err => console.log(err));
    };

    const deleteQuestion = (id) => {
        axios.delete(process.env.REACT_APP_BACKEND_URL + `/question/${id}`).then((res) => {
            console.log(res.data);
            if (res.data.status) {
                // toast.success("Trait Successfully Deleted!");
                toast.success(res.data.message);
                getQuestions()
            } else {
                toast.warn(res.data.message);
            }
        }
        ).catch(err => console.log(err))
    };

    const handleFileUpload = (e) => {
        const file = e.target.files[0];
        const reader = new FileReader();

        reader.onload = (event) => {
            const workbook = XLSX.read(event.target.result, { type: 'binary' });
            const sheetName = workbook.SheetNames[0];
            const sheet = workbook.Sheets[sheetName];
            // const sheetData = XLSX.utils.sheet_to_json(sheet);

            // Read data excluding 'sno' column
            // Parse the sheet data and ignore the 'S No' column
            const sheetData = XLSX.utils.sheet_to_json(sheet, {
                header: ['sno', 'question', 'questionOthers', 'trait'],  // Map headers
                range: 1  // Skip header row in data parsing
            }).map(({ question, questionOthers, trait }) => ({ question, questionOthers, trait })); // Ignore 'sno'


            setData(sheetData);
            setFileJsonData(sheetData);
        }
        reader.readAsBinaryString(file);
    };

    const downloadTemplate = () => {
        // Define the header row
        // const headerRow = [['S No','Question', 'Question Others', 'Trait']];
        const data = [
            [{ v: 'S No', s: { font: { bold: true } } }, { v: 'Question' }, { v: 'Question Others' }, { v: 'Trait' }]
        ];
        const ws = XLSX.utils.aoa_to_sheet(data);

        // Freeze the first row
        ws['!freeze'] = { ySplit: 1 };

        // Create a new workbook and add the worksheet
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Questions Template');

        // Generate an Excel file and trigger a download
        const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
        const blob = new Blob([excelBuffer], { type: 'application/octet-stream' });
        FileSaver.saveAs(blob, 'Questions_Template.xlsx');
    };

    // Step 1: Create a mapping of trait names to their respective _id values
    const traitMapping = Array.isArray(Trait) && Trait.reduce((map, trait) => {
        const trimmedTraitName = trait.traitName.trim();
        map[trimmedTraitName] = trait._id;
        return map;
    }, {});

    // Step 2: Replace the trait value in each question object with the corresponding _id and add a question code
    const updatedQuestions = fileJsonData.map((question, index) => {
        const trimmedTrait = question.trait.trim();
        return {
            ...question,
            trait: traitMapping[trimmedTrait],
            questionCode: `Q-${index + 1}`
        };
    });


    const handleFileSubmit = (e) => {
        e.preventDefault();

        console.log("File Data ", data);
        console.log("JSON Data", fileJsonData);
        console.log("Fetched Data", updatedQuestions);

        let questionData = []
        updatedQuestions.map((questionItem, index) => {
            questionData = [...questionData, { question: questionItem.question, questionOthers: questionItem.questionOthers, trait: questionItem.trait }];

        })

        axios.post(process.env.REACT_APP_BACKEND_URL + '/questions/upload', questionData)
            .then((res) => {
                if (res.status === 200) {
                    toast.success("Questions Inserted Successfully!");
                    getQuestions();
                } else {
                    toast.warn("Something Went Wrong!");
                }
            })
            .catch((err) => {
                console.log(err?.message)
                toast.warn("Duplicate Question Code");
            });
    }


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
                                {/* <h3 className="mb-0">All Questions</h3> */}
                                <h3 className="mb-0">جميع الأسئلة</h3>
                                <div>
                                    {/* <Button className='btn btn-primary' onClick={() => setBtnActive(true)} disabled={btnActive}>Subject</Button>
                                    <Button className='btn btn-primary' onClick={() => setBtnActive(false)} disabled={!btnActive}>Respondents</Button> */}
                                    <Button className='btn btn-primary' onClick={() => setBtnActive(true)} disabled={btnActive}>الفرد المُقيَّم</Button>
                                    <Button className='btn btn-primary' onClick={() => setBtnActive(false)} disabled={!btnActive}>االمقيمون الآخرون </Button>

                                    <Button onClick={uploadToggle}><i className="fa-solid fa-upload"></i> Upload Questions</Button>
                                    <Button onClick={toggle}><i className="fa-solid fa-plus me-2"></i> Add Question</Button>
                                </div>
                                <Modal isOpen={uploadModal} toggle={uploadToggle} >
                                    <form onSubmit={handleFileSubmit}>
                                        <ModalHeader toggle={uploadToggle}>
                                            {/* <h3 className="mb-0"> Upload Questions</h3> */}
                                            <h3 className="mb-0"> تحميل الأسئلة</h3>
                                        </ModalHeader>
                                        <ModalBody>
                                            <input type="file" onChange={handleFileUpload} />
                                            <Button className="btn btn-link mt-2" onClick={downloadTemplate}> Download Question Template </Button>
                                        </ModalBody>
                                        <ModalFooter>
                                            <Button color="primary" className='px-5 my-2' type="submit"> Upload </Button>
                                            <Button color="secondary" onClick={uploadToggle}> Cancel </Button>
                                        </ModalFooter>
                                    </form>
                                </Modal>

                                <Modal isOpen={modal} toggle={toggle} >
                                    <form onSubmit={handleSubmit(onSubmit)}>
                                        <ModalHeader toggle={toggle}>
                                            {/* <h3 className="mb-0">{updateMode ? 'Update Question' : 'Add Question'}</h3> */}
                                            <h3 className="mb-0">{updateMode ? 'Update Question' : 'إضافة سؤال'}</h3>
                                        </ModalHeader>
                                        <ModalBody>
                                            <div className="col-12 py-lg-2">
                                                <label htmlFor="" className="form-label">Enter Question for Subject</label>
                                                <input {...register("question")} className="form-control" type="text" placeholder='Enter Question for Subject' />
                                                {errors.question && <p className='form-error'>Question for Subject is Required!</p>}
                                            </div>
                                            <div className="col-12 py-lg-2">
                                                <label htmlFor="" className="form-label">Enter Question for Respondents</label>
                                                <input {...register("questionOthers")} className="form-control" type="text" placeholder='Enter Question for Respondents' />
                                                {errors.questionOthers && <p className='form-error'>Question for Respondents is Required!</p>}
                                            </div>
                                            <div className="col-12 py-lg-2">
                                                <label htmlFor="" className="form-label">Select A Trait</label>
                                                <select  {...register("trait")} className="form-control" placeholder="Select a Trait">
                                                    <option selected={true}>Select a Trait</option>
                                                    {Array.isArray(Trait) &&
                                                        Trait.length >= 1 ? Trait.map((el, index) => {
                                                            return (<>
                                                                <option value={el._id} className='text-dark'>{el.traitName}</option>
                                                            </>)
                                                        }) : <>No Trait Available</>
                                                    }

                                                </select>
                                                {errors.trait && <p className='form-error'>Trait is Required!</p>}
                                            </div>
                                            {/* <div className="col-12 py-lg-2">
                                                <label htmlFor="" className="form-label">Enter Question Code</label>
                                                <input {...register("questionCode")} className="form-control" type="text" value={nextQuestionCode} />
                                                {errors.questionCode && <p className='form-error'>Question Code is Required!</p>}
                                            </div> */}
                                        </ModalBody>
                                        <ModalFooter>
                                            <Button color="primary" className='px-5 my-2' type="submit"> Submit </Button>
                                            <Button color="secondary" onClick={toggle}> Cancel </Button>
                                        </ModalFooter>
                                    </form>
                                </Modal>
                            </CardHeader>
                            <CardBody>
                                <table className="table table-hover header-dash">
                                    <thead className='position-relative'>
                                        <tr className=''>
                                            {/* <th scope="col" className='text-center align-text-top ps-1 bg-dark text-white' style={{ width: '6rem' }}>S.No</th>
                                            <th scope="col" className='text-start align-text-top ps-2 bg-dark text-white'>Code</th>
                                            <th scope="col-6" className='text-start align-text-top ps-2 bg-dark text-white'>Question</th>
                                            <th scope="col-2" className='text-start align-text-top ps-2 bg-dark text-white'>Trait</th>
                                            <th scope="col" className='text-center align-text-top ps-2 bg-dark text-white'>Created At</th> */}

                                            <th scope="col" className='text-center align-text-top ps-1 bg-dark text-white' style={{ width: '6rem' }}>الرقم التسلسلي</th>
                                            <th scope="col" className='text-start align-text-top ps-2 bg-dark text-white'>الرمز</th>
                                            <th scope="col-6" className='text-start align-text-top ps-2 bg-dark text-white'>السؤال</th>
                                            <th scope="col-2" className='text-start align-text-top ps-2 bg-dark text-white'>السمة</th>
                                            <th scope="col" className='text-center align-text-top ps-2 bg-dark text-white'>تاريخ الإنشاء</th>
                                            {/* <th scope="col" className='text-center align-text-top ps-2'>Updated At</th> */}
                                            <th scope="col" className='text-center align-text-top ps-2 bg-dark text-white'></th>
                                        </tr>
                                    </thead>

                                    <tbody className=''>
                                        {/* {pageData.map((el, index) => { */}
                                        {Array.isArray(Questions) && Questions.map((el, index) => {
                                            return (
                                                <tr key={el._id}>
                                                    <td className='text-center ps-1 align-middle' style={{ width: '8rem' }}>{index + 1}</td>
                                                    <td className='text-start ps-1 align-middle'>{el.questionCode}</td>
                                                    <td className='text-start ps-1 align-middle'>
                                                        <span style={btnActive ? { display: 'block' } : { display: 'none' }}>{el.question}</span>
                                                        <span style={btnActive ? { display: 'none' } : { display: 'block' }}>{el.questionOthers}</span>
                                                    </td>
                                                    <td className='text-start ps-1 align-middle'>{el.trait.traitName}</td>
                                                    <td className='text-center ps-1 align-middle'>{new Date(el.createdOn).toLocaleDateString()}</td>
                                                    <td className='text-center ps-1 '>
                                                        <button className='btn p-2 text-success fs-4' type='button' onClick={() => { selectedQuestion(el); toggle(); }} > <i className="fa-solid fa-pencil"></i></button>

                                                        <Popup trigger={<button className=' p-2 bg-transparent border border-0'><i className="fa-solid fa-trash text-danger"></i></button>} position="top right">
                                                            <div className='py-1 p-2'>Are you sure you want to delete <span className='text-danger fs-5 fw-bold'>{el.question}</span>?</div>
                                                            <button className='btn btn-danger my-3 py-1 mx-2' onClick={() => deleteQuestion(el._id)}>Delete</button>
                                                        </Popup>
                                                    </td>
                                                </tr>
                                            );
                                        })
                                        }
                                    </tbody>
                                </table>
                            </CardBody>
                        </Card>
                    </div>
                </Row>
            </Container>
        </>
    );
};

export default QuestionManagement;
