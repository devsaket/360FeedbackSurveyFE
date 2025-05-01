import { jwtDecode } from "jwt-decode";

export function getCurrentDate(separator = '/') {
    let newDate = new Date()

    let date = newDate.getDate();
    let month = newDate.getMonth() + 1;
    let year = newDate.getFullYear();

    return `${year}${separator}${month < 10 ? `0${month}` : `${month}`}${separator}${date < 10 ? `0${date}` : `${date}`}`
}

export const canAccessRole2 = () => {
    const token = localStorage.getItem("authUserToken");
    const role = localStorage.getItem("userRole");

    if (!token || role !== "2") return false;
    try {
        const { exp } = jwtDecode(token);            // seconds since Epoch
        if (Date.now() >= exp * 1000) {
            localStorage.removeItem("authUserToken");  // tidy up
            localStorage.removeItem("userRole");
            return false;
        }
    } catch {
        return false;                                // token is malformed
    }
    return true;
};