import React from "react";
import BookComponent from "./BookComponent";
import { BACKEND_URL } from "../config"; 

export default function Test() {
    return (
        <div>
            <h1>Test Page</h1>
            <BookComponent />
            <BookComponent />
            <BookComponent />
        </div>
    );
}