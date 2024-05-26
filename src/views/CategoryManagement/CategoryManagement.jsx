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

const CategorySchema = Joi.object({
    categoryName: Joi.string().required(),
    categoryLabel: Joi.string().required(),
    scoreWeightage: Joi.string().required()
});


const CategoryManagement = () => {
    const [copiedText, setCopiedText] = useState();


    const [modal, setModal] = useState(false);

    const [Categories, setCategories] = useState([]);

    const toggle = () => setModal(!modal);

    // Fetch Category Data
    useEffect(() => {
        getCategory()
    }, []);

    const getCategory = () => {
        axios.get('http://localhost:5454/api/v1/categoryRoles/')
            .then(res => {
                setCategories(res.data);
            })
            .catch(err => console.log(err));
    }

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors }
    } = useForm({
        resolver: joiResolver(CategorySchema),
        defaultValues: {
            categoryName: "",
            categoryLabel: "",
            scoreWeightage: ""
        }
    });

    const onSubmit = (data) => {
        axios.post('http://localhost:5454/api/v1/categoryRoles', data)
            .then((res) => {
                if (res.data.status) {
                    reset({ categoryName: "", categoryLabel: "", scoreWeightage: "" });
                    toast.success("Trait Inserted Successfully!");
                    toggle();
                    getCategory();
                } else {
                    toast.warn("Something Went Wrong!");
                }
            })
            .catch((err) => console.log(err?.message));
    }


    const deleteCategory = (id) => {
        axios.delete(`http://localhost:5454/api/v1/categoryRoles/${id}`).then((res) => {
            console.log(res.data);
            if (res.data.status) {
                // toast.success("Category Successfully Deleted!");
                toast.success(res.data.message);
                getCategory()
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
                                <h3 className="mb-0">All Categories</h3>
                                <Button onClick={toggle}><i className="fa-solid fa-plus me-2"></i> Add Category</Button>
                                <Modal isOpen={modal} toggle={toggle}   >
                                    <form onSubmit={handleSubmit(onSubmit)}>
                                        <ModalHeader toggle={toggle}>
                                            <h3 className="mb-0">Add Category</h3>
                                        </ModalHeader>
                                        <ModalBody>
                                            <label className="form-label">Category Name</label>
                                            <input {...register("categoryName")} className="form-control" type="text" placeholder="Enter Category Name" />
                                            {errors.categoryName && <p className='form-error'>Category Name is Required!</p>}

                                            <label className="form-label">Category Label</label>
                                            <input  {...register("categoryLabel")} className="form-control" placeholder="Enter Category Label" />
                                            {errors.categoryLabel && <p className='form-error'>Category Label is Required!</p>}

                                            <label className="form-label">Score Weightage</label>
                                            <input  {...register("scoreWeightage")} className="form-control" placeholder="Enter Score Weightage" />
                                            {errors.scoreWeightage && <p className='form-error'>Score Weightage is Required!</p>}

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
                                            <th scope="col" className='text-center align-text-top ps-2 bg-dark text-white' style={{ width: '8rem' }}>S.No</th>
                                            <th scope="col" className='text-start align-text-top ps-2 bg-dark text-white'>Category Name</th>
                                            <th scope="col" className='text-start align-text-top ps-2 bg-dark text-white'>Category Label</th>
                                            <th scope="col" className='text-center align-text-top ps-2 bg-dark text-white'>Score Weightage</th>
                                            <th scope="col" className='text-center align-text-top ps-2 bg-dark text-white'>Created At</th>
                                            <th scope="col" className='text-center align-text-top ps-2 bg-dark text-white'></th>
                                        </tr>
                                    </thead>

                                    <tbody className=''>
                                        {Categories.map((el, index) => {
                                            return (
                                                <tr key={el._id}>
                                                    <td className='text-center ps-1 align-middle' style={{ width: '8rem' }}>{index + 1}</td>
                                                    <td className='text-start ps-3 align-middle'>{el.categoryName}</td>
                                                    <td className='text-start ps-3 align-middle'>{el.categoryLabel}</td>
                                                    <td className='text-center ps-1 align-middle'>{el.scoreWeightage}</td>
                                                    <td className='text-center ps-1 align-middle'>{new Date(el.createdOn).toLocaleDateString()}</td>
                                                    <td className='text-center ps-1 '>

                                                        <Popup trigger={<button className=' p-2 bg-transparent border border-0'><i className="fa-solid fa-trash text-danger"></i></button>} position="top right">
                                                            <div className='py-1 p-2'>Are you sure you want to delete <span className='text-danger fs-5 fw-bold'>{el.categoryName}</span>?</div>
                                                            <button className='btn btn-danger my-3 py-1 mx-2' onClick={() => deleteCategory(el._id)}>Delete</button>
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

export default CategoryManagement;
