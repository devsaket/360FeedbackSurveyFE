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
import React from "react";
import { useLocation, Route, Routes, Navigate } from "react-router-dom";
// reactstrap components
import { Container, Row } from "reactstrap";
// core components
import AdminFooter from "components/Footers/AdminFooter.js";

import routes from "routes.js";
import SurveyPreview from "components/WebPages/SurveyPreview";
import SurveyPreviewRespondents from "components/WebPages/SurveyPreviewRespondents";
import WebsiteNavbar from "components/Navbars/WebsiteNavbar";
import SurveyPreviewProduct from "components/WebPages/SurveyPreviewProduct";
import SurveyResultUser from '../components/WebPages/SurveyResultUser';
import SurveyResultSubjectRespondentResponse from "components/WebPages/SurveyResultSubjectRespondentResponse";

const WebsiteLayout = (props) => {
    const mainContent = React.useRef(null);
    const location = useLocation();

    React.useEffect(() => {
        document.documentElement.scrollTop = 0;
        document.scrollingElement.scrollTop = 0;
        mainContent.current.scrollTop = 0;
    }, [location]);

    const getRoutes = (routes) => {
        return routes.map((prop, key) => {
            if (prop.layout === "/website") {
                return (
                    <Route path={prop.path} element={prop.component} key={key} exact />
                );
            } else {
                return null;
            }
        });
    };

    const getBrandText = (path) => {
        for (let i = 0; i < routes.length; i++) {
            if (
                props?.location?.pathname.indexOf(routes[i].layout + routes[i].path) !==
                -1
            ) {
                return routes[i].name;
            }
        }
        return "Brand";
    };

    return (
        <>
            {/* <div className="main-content" ref={mainContent}>
                
                <Routes>
                    {getRoutes(routes)}

                    <Route exact path="/survey-self/:id/:subjectId" element={<SurveyPreview />} />
                    <Route exact path="/survey-respondent/:id/:subjectId/:respondentId" element={<SurveyPreviewRespondents />} />

                    <Route path="*" element={<Navigate to="/index" replace />} />
                </Routes>
                <Container fluid> */}
                    {/* <AdminFooter /> */}
                {/* </Container>
            </div> */}

            <div className="main-content" ref={mainContent}>
                <WebsiteNavbar {...props} />

                <div className="header bg-gradient-info py-7 py-lg-8">

                </div>
                {/* Page content */}
                <Container className="mt--8 pb-5">
                    <Row className="justify-content-center">
                        <Routes>
                            {getRoutes(routes)}

                            <Route exact path="/survey-preview/:id" element={<SurveyPreviewProduct />} />
                            <Route exact path="/survey-self/:id/:subjectId" element={<SurveyPreview />} />
                            <Route exact path="/survey-respondent/:id/:subjectId/:respondentId" element={<SurveyPreviewRespondents />} />

                            <Route exact path="/survey-result-user/:id/:subjectId" element={<SurveyResultSubjectRespondentResponse />} />
                            <Route exact path="/survey-analysis/:id/:subjectId" element={<SurveyResultUser />} />

                            <Route path="*" element={<Navigate to="/website/login" replace />} />
                        </Routes>
                    </Row>
                </Container>
            </div>
        </>
    );
};

export default WebsiteLayout;
