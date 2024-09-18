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
import Index from "views/Index.js";
import Profile from "views/examples/Profile.js";
import Maps from "views/examples/Maps.js";
import Register from "views/examples/Register.js";
import Login from "views/examples/Login.js";
import Tables from "views/examples/Tables.js";
import Icons from "views/examples/Icons.js";
import TraitManagement from "views/TraitManagement/TraitManagement";
import QuestionManagement from "views/QuestionManagement/QuestionManagement";
import SurveyManagement from "views/SurveyManagement/SurveyManagement";
import SurveyDetails from "views/SurveyManagement/SurveyDetails";
import ItemBankManagement from "views/ItemBankManagement/ItemBankManagement";
import CategoryManagement from "views/CategoryManagement/CategoryManagement";
import EmailTemplateManagement from "views/EmailTemplateManagement/EmailTemplateManagement";
import WebsitePagesLayout from "views/WebsitePages/WebsitePagesLayout";

var routes = [
  {
    path: "/index",
    name: "Dashboard",
    icon: "ni ni-tv-2 text-primary",
    component: <Index />,
    layout: "/admin",
  },
  // {
  //   path: "/icons",
  //   name: "Icons",
  //   icon: "ni ni-planet text-blue",
  //   component: <Icons />,
  //   layout: "/admin",
  // },
  // {
  //   path: "/maps",
  //   name: "Maps",
  //   icon: "ni ni-pin-3 text-orange",
  //   component: <Maps />,
  //   layout: "/admin",
  // },
  // {
  //   path: "/user-profile",
  //   name: "User Profile",
  //   icon: "ni ni-single-02 text-yellow",
  //   component: <Profile />,
  //   layout: "/admin",
  // },
  // {
  //   path: "/tables",
  //   name: "Tables",
  //   icon: "ni ni-bullet-list-67 text-red",
  //   component: <Tables />,
  //   layout: "/admin",
  // },
  // {
  //   path: "/login",
  //   name: "Login",
  //   icon: "ni ni-key-25 text-info",
  //   component: <Login />,
  //   layout: "/auth",
  // },
  // {
  //   path: "/register",
  //   name: "Register",
  //   icon: "ni ni-circle-08 text-pink",
  //   component: <Register />,
  //   layout: "/auth",
  // },
  {
    path: "/trait",
    name: "Trait",
    icon: "ni ni-bullet-list-67 text-blue",
    component: <TraitManagement />,
    layout: "/admin",
  },
  {
    path: "/question",
    name: "Questions",
    icon: "ni ni-bullet-list-67 text-blue",
    component: <QuestionManagement />,
    layout: "/admin",
  },
  {
    path: "/survey-management",
    name: "Surveys",
    icon: "ni ni-tv-2 text-primary",
    component: <SurveyManagement />,
    layout: "/admin",
  },
  {
    path: "/item-bank",
    name: "Item Bank",
    icon: "ni ni-briefcase-24 text-blue",
    component: <ItemBankManagement />,
    layout: "/admin",
  },
  // {
  //   path: "/category",
  //   name: "Category Roles",
  //   icon: "ni ni-archive-2 text-dark",
  //   component: <CategoryManagement />,
  //   layout: "/admin",
  // },
  // {
  //   path: "",
  //   name: "Decision Support for Education Consulting",
  //   icon: "fa-solid fa-home text-dark",
  //   component: <WebsitePagesLayout />,
  //   layout: "/website",
  // },
];
export default routes;
