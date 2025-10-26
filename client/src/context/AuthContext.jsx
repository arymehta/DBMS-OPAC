import React, { useEffect, createContext, useReducer } from "react";
import { BACKEND_URL } from "../config";
const AuthContext = createContext();

const initialState = {
    isAuthenticated: false,
    loading: true,
    token: null,
    user: null,
    profile: null
};

const authReducer = (state, action) => {
    switch (action.type) {
        case "LOGIN":
            localStorage.setItem("token", action.payload.token);
            return {
                ...state,
                isAuthenticated: true,
                loading: false,
                user: action.payload.user,
                token: action.payload.token,
            };
        case "LOGOUT":
            localStorage.removeItem("token");
            return {
                ...state,
                isAuthenticated: false,
                loading: false,
                user: null,
                token: null,
                profile: null,
            };
        case "SET_LOADING":
            return {
                ...state,
                loading: action.payload,
            };
        case "SET_USER":
            return {
                ...state,
                user: action.payload,
            };
        case "SET_PROFILE":
            return {
                ...state,
                profile: action.payload,
            };
        default:
            return state;
    }
};

const AuthProvider = ({ children }) => {
    const [state, dispatch] = useReducer(authReducer, initialState);

    const checkAuth = async (token) => {
        try {
            const res = await fetch(`${BACKEND_URL}/auth/check-auth`, {
                method: "GET",
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            console.log(res);
            const data = await res.json();
            if (res.ok) {
                dispatch({
                    type: "LOGIN",
                    payload: { user: data.data, token },
                });
            } else {
                dispatch({ type: "LOGOUT" });
            }
        } catch (error) {
            console.error("Error checking authentication:", error);
            dispatch({ type: "LOGOUT" });
        }
    }

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (token) {
            dispatch({ type: "SET_LOADING", payload: true });
            checkAuth(token);
        }else {
            dispatch({ type: "LOGOUT" });
        }
    }, []);

    return (
        <AuthContext.Provider value={{ state, dispatch }}>
            {children}
        </AuthContext.Provider>
    )
}

export { AuthContext, AuthProvider };