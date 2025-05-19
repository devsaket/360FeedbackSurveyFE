/*!

=========================================================
* Argon Dashboard React - v1.2.4
=========================================================
*/
import { useState, useEffect } from "react";
// react component that copies the given text inside your clipboard
import { CopyToClipboard } from "react-copy-to-clipboard";
import axios from 'axios';

import Popup from 'reactjs-popup';
import 'reactjs-popup/dist/index.css';
import { toast } from 'react-toastify';
import { useForm } from "react-hook-form";
import { joiResolver } from "@hookform/resolvers/joi";
import Joi from "@hapi/joi";
import 'react-toastify/dist/ReactToastify.css';
import { Link } from 'react-router-dom';
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

const TraitSchema = Joi.object({
    traitName: Joi.string().required(),
    traitDescription: Joi.string().required(),
    status: Joi.boolean().required()
});

const TraitManagement = () => {
    const userRole = localStorage.getItem("userRole");
    const [copiedText, setCopiedText] = useState();

    const [modal, setModal] = useState(false);

    const [Trait, setTrait] = useState([]);
    const [updateMode, setUpdateMode] = useState(false);
    const [updateTrait, setSelectedTrait] = useState({});

    const toggle = () => setModal(!modal);

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors }
    } = useForm({
        resolver: joiResolver(TraitSchema),
        defaultValues: {
            traitName: "",
            traitDescription: "",
            status: true
        }
    });

    // Fetch trait Data
    useEffect(() => {
        axios.get(process.env.REACT_APP_BACKEND_URL + '/trait/')
            .then(res => {
                setTrait(res.data);
            })
            .catch(err => console.log(err));
    }, []);

    const onSubmit = (data) => {
        if (updateMode) {
            const postData = { ...data, _id: updateTrait._id };
            axios.put(process.env.REACT_APP_BACKEND_URL + `/trait/${updateTrait._id}`, postData)
                .then((res) => {
                    if (res.data.status) {
                        reset({ traitName: "", traitDescription: "", status: true });
                        toast.success(res.data.message);
                        toggle();
                        getTrait();
                        setUpdateMode(false);
                        setSelectedTrait({})
                    } else {
                        toast.warn(res.data.message);
                    }
                })
        } else {
            axios.post(process.env.REACT_APP_BACKEND_URL + '/trait', data)
                .then((res) => {
                    if (res.data.status) {
                        reset({ traitName: "", traitDescription: "", status: true });
                        toast.success("Trait Inserted Successfully!");
                        toggle();
                        getTrait();
                    } else {
                        toast.warn("Something Went Wrong!");
                        getTrait();
                    }
                })
                .catch((err) => console.log(err?.message));
        }

    };

    const getTrait = () => {
        axios.get(process.env.REACT_APP_BACKEND_URL + '/trait/')
            .then(res => {
                setTrait(res.data);
            })
            .catch(err => console.log(err));
    };

    const selectedTrait = (data) => {
        setUpdateMode(true);
        reset({ traitName: data.traitName, traitDescription: data.traitDescription, status: true });
        setSelectedTrait(data);

    };

    const deleteTrait = (id) => {
        axios.delete(process.env.REACT_APP_BACKEND_URL + `/trait/${id}`).then((res) => {
            console.log(res.data);
            if (res.data.status) {
                // toast.success("Trait Successfully Deleted!");
                toast.success(res.data.message);
                getTrait()
            } else {
                toast.warn(res.data.message);
            }
        }
        ).catch(err => console.log(err))
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
                                {/* <h3 className="mb-0">All Traits</h3> */}
                                <h3 className="mb-0">جميع السمات</h3>
                                {/* <Button onClick={toggle}><i className="fa-solid fa-plus me-2"></i> Add Trait</Button> */}
                                <Button onClick={toggle}><i className="fa-solid fa-plus me-2"></i> إضافة سمة</Button>
                                <Modal isOpen={modal} toggle={toggle}   >
                                    <form onSubmit={handleSubmit(onSubmit)}>
                                        <ModalHeader toggle={toggle}>
                                            <h3 className="mb-0">{updateMode ? 'Update' : 'Add'} Trait</h3>
                                        </ModalHeader>
                                        <ModalBody>

                                            <div className="row">
                                                <div className="col-12">
                                                    <label className="form-label">Trait Name</label>
                                                    <input {...register("traitName")} className="form-control" type="text" placeholder="Enter Trait Name" />
                                                    {errors.traitName && <p className='form-error'>Trait Name is Required!</p>}

                                                    <label className="form-label mt-2">Trait Description</label>
                                                    <TextareaAutosize  {...register("traitDescription")} className="form-control" placeholder="Enter Trait Description" minRows={3} maxRows={5}></TextareaAutosize>
                                                    {errors.traitDescription && <p className='form-error'>Trait Description is Required!</p>}
                                                </div>
                                            </div>

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
                                <table className="table table-hover header-dash">
                                    <thead className='position-relative'>
                                        <tr className=''>
                                            {/* <th scope="col" className='text-center align-text-top ps-2 bg-dark text-white' style={{ width: '8rem' }}>S.No</th>
                                            <th scope="col" className='text-start align-text-top ps-2 bg-dark text-white'>Trait Name</th>
                                            <th scope="col" className='text-start align-text-top ps-2 w-50 bg-dark text-white' style={{ maxWidth: '15rem' }}>Trait Description</th>
                                            <th scope="col" className='text-center align-text-top ps-2 bg-dark text-white'>Created At</th>
                                            <th scope="col" className='text-center align-text-top ps-2 bg-dark text-white'></th> */}

                                            <th scope="col" className='text-center align-text-top ps-2 bg-dark text-white' style={{ width: '8rem' }}>الرقم التسلسلي</th>
                                            <th scope="col" className='text-start align-text-top ps-2 bg-dark text-white'>اسم السمة</th>
                                            <th scope="col" className='text-start align-text-top ps-2 w-50 bg-dark text-white' style={{ maxWidth: '15rem' }}>تعريف السمة</th>
                                            <th scope="col" className='text-center align-text-top ps-2 bg-dark text-white'>تاريخ الإنشاء</th>
                                            <th scope="col" className='text-center align-text-top ps-2 bg-dark text-white'></th>
                                        </tr>
                                    </thead>

                                    <tbody className=''>
                                        {/* {pageData.map((el, index) => { */}
                                        {Array.isArray(Trait) && Trait.map((el, index) => {
                                            return (
                                                <tr key={el._id}>
                                                    <td className='text-center ps-1 align-start' style={{ width: '8rem' }}>{index + 1}</td>
                                                    <td className='text-start ps-1 align-start'><Link to={`/admin/trait-question/${el._id}`}>{el.traitName}</Link></td>
                                                    <td className='text-start ps-1 align-start' style={{ maxWidth: '15rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{el.traitDescription}</td>
                                                    <td className='text-center ps-1 align-start'>{new Date(el.createdOn).toLocaleDateString()}</td>
                                                    <td className='text-center ps-1 '>
                                                        <button className='btn p-2 text-success fs-4' type='button' onClick={() => { selectedTrait(el); toggle(); }} > <i className="fa-solid fa-pencil"></i></button>
                                                        {
                                                            userRole === '0' ?
                                                                <>
                                                                    <Popup trigger={<button className=' p-2 bg-transparent border border-0'><i className="fa-solid fa-trash text-danger"></i></button>} position="top right">
                                                                        <div className='py-1 p-2'>Are you sure you want to delete <span className='text-danger fs-5 fw-bold'>{el.traitName}</span>?</div>
                                                                        <button className='btn btn-danger my-3 py-1 mx-2' onClick={() => deleteTrait(el._id)}>Delete</button>
                                                                    </Popup>
                                                                </> : <> </>
                                                        }
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

export default TraitManagement;
