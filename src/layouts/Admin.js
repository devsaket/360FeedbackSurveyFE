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
import { Container } from "reactstrap";
// core components
import AdminNavbar from "components/Navbars/AdminNavbar.js";
import AdminFooter from "components/Footers/AdminFooter.js";
import Sidebar from "components/Sidebar/Sidebar.js";

import routes from "routes.js";
import SurveyDetails from "views/SurveyManagement/SurveyDetails";
import SurveyShareByEmail from "views/SurveyManagement/SurveyShareByEmail";
import SurveyResultManagement from "views/SurveyManagement/SurveyResultManagement";
import CategoryManagement from "views/CategoryManagement/CategoryManagement";
import EmailTemplateManagement from "views/EmailTemplateManagement/EmailTemplateManagement";
import SurveySubjectResultManagement from '../views/SurveyManagement/SurveySubjectResultManagement';
import SurveyAnalysis from "views/SurveyManagement/SurveyAnalysis";
import SurveyNewAnalysis from "views/SurveyManagement/SurveyNewAnalysis";
import SurveyShareBySMS from "views/SurveyManagement/SurveyShareBySMS";
import UserManagement from "views/UserManagement/UserManagement";
import SurveyNewAnalysisArabic from 'views/SurveyManagementArabic/SurveyNewAnalysisArabic';
import SurveyShareInstructions from '../views/SurveyManagement/SurveyShareInstructions';

const PrivateRoute = ({ children }) => {
  const token = localStorage.getItem("authToken");
  return token ? children : <Navigate to="/auth/login" />;
};


const Admin = (props) => {
  const mainContent = React.useRef(null);
  const location = useLocation();

  React.useEffect(() => {
    document.documentElement.scrollTop = 0;
    document.scrollingElement.scrollTop = 0;
    mainContent.current.scrollTop = 0;
  }, [location]);

  const getRoutes = (routes) => {
    return routes.map((prop, key) => {
      if (prop.layout === "/admin") {
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
      <Sidebar
        {...props}
        routes={routes}
        logo={{
          innerLink: "/admin/index",
          imgSrc: require("../assets/img/brand/argon-react.png"),
          imgAlt: "...",
        }}
      />
      <div className="main-content" ref={mainContent}>
        <AdminNavbar
          {...props}
          brandText={getBrandText(props?.location?.pathname)}
        />
        <Routes>
          {getRoutes(routes)}

          <Route path="/category" element={<PrivateRoute><CategoryManagement /></PrivateRoute>} />
          <Route path="/users" element={<PrivateRoute><UserManagement /></PrivateRoute>} />
          <Route path="/email-templates" element={<PrivateRoute><EmailTemplateManagement /></PrivateRoute>} />


          <Route path="/survey-details/:id" element={<PrivateRoute><SurveyDetails /></PrivateRoute>} />
          <Route path="/survey-share-instructions/:id" element={<PrivateRoute><SurveyShareInstructions /></PrivateRoute>} />
          <Route path="/survey-share-email/:id" element={<PrivateRoute><SurveyShareByEmail /></PrivateRoute>} />
          <Route path="/survey-share-by-sms/:id" element={<PrivateRoute><SurveyShareBySMS /></PrivateRoute>} />
          <Route path="/survey-result/:surveyId" element={<PrivateRoute><SurveyResultManagement /></PrivateRoute>} />
          <Route path="/survey-result-by-subject/:surveyId/:subjectId" element={<PrivateRoute><SurveySubjectResultManagement /></PrivateRoute>} />
          <Route exact path= "/survey/analysis/:id/:subjectId" element={<PrivateRoute><SurveyAnalysis /></PrivateRoute>} />
          <Route exact path= "/survey/analysis-new/:id/:subjectId" element={<PrivateRoute><SurveyNewAnalysis /></PrivateRoute>} />
          <Route exact path= "/survey/analysis-ar/:id/:subjectId" element={<PrivateRoute><SurveyNewAnalysisArabic /></PrivateRoute>} />

          <Route path="*" element={<PrivateRoute><Navigate to="/admin/index" replace /></PrivateRoute>} />
        </Routes>
        <Container fluid>
          {/* <AdminFooter /> */}
        </Container>
      </div>
    </>
  );
};

export default Admin;
