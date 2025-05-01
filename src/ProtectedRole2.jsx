// src/auth/ProtectedRole2.jsx
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { canAccessRole2 } from "./helpers";

const ProtectedRole2 = () => {
    const location = useLocation();

    if (canAccessRole2()) return <Outlet />;

    // ----- user is NOT authorised -------------
    // ① Pass the target path in the `state` object (SPA-only)………………
    const toRegister = {
        pathname: "/website/register",
        state: { from: location },                // location object itself
        replace: true,
    };

    // ② Persist it as a *fallback* in localStorage (survives reload)……
    localStorage.setItem("postAuthRedirect", location.pathname);
    
    const match = location.pathname.match(/\/survey-preview\/([^/]+)/);
    if (match) localStorage.setItem("postAuthSurveyId", match[1]); // "123"

    return <Navigate to={toRegister} replace />;
}


export default ProtectedRole2;
