# Overview

This documentation outlines the API routes for a library management system. The system is built using Express.js and provides endpoints for authentication, book management, catalog browsing, fine management, ISBN-based book operations, issue tracking, member statistics, and reservation management. This documentation is intended for developers integrating with this API or maintaining its codebase.

# API Routes

This section describes the available routes, their purpose, and the expected request/response structures.

## 1. Authentication Routes (auth.js)

- **Purpose:** Handles user authentication and authorization, including signup, login, OTP verification, and password reset functionalities.

- **Dependencies:**
  - `express`: For creating the router.
  - `../controllers/auth.js`: Contains the route handler functions (signup, verifyOtp, login, requestResetPassword, confirmResetPassword, resendOtp, checkAuth).

- **Routes:**
    - `POST /signup`: Registers a new user.
        - *Controller Function:* `signup`
    - `POST /verify-otp`: Verifies the OTP (One-Time Password) sent to the user during signup or password reset.
        - *Controller Function:* `verifyOtp`
    - `POST /resend-otp`: Resends the OTP to the user.
        - *Controller Function:* `resendOtp`
    - `POST /login`: Logs in an existing user.
        - *Controller Function:* `login`
    - `POST /reset-password`: Initiates the password reset process.
        - *Controller Function:* `requestResetPassword`
    - `POST /reset-password/confirm`: Confirms the password reset with a new password.
        - *Controller Function:* `confirmResetPassword`
    - `GET /check-auth`: Checks if the user is currently authenticated.
        - *Controller Function:* `checkAuth`

- **Snippet:**
```javascript
import express from 'express';
import {
  signup,
  verifyOtp,
  login,
  requestResetPassword,
  confirmResetPassword,
  resendOtp,
  checkAuth
} from '../controllers/auth.js';

const router = express.Router();

router.post('/signup', signup);
```

## 2. Book Routes (books.js)

- **Purpose:** Provides endpoints for retrieving book details and the total number of books.

- **Dependencies:**
  - `express`: For creating the router.
  - `../controllers/books.js`: Contains the route handler functions (getBookDetails, getTotalNumBooks).

- **Routes:**
    - `GET /:id`: Retrieves details for a specific book, where `:id` is the book's ID.
        - *Controller Function:* `getBookDetails`
    - `GET /get/total-books`: Retrieves the total number of books in the library.
        - *Controller Function:* `getTotalNumBooks`

- **Snippet:**
```javascript
import express from "express";
import { getBookDetails, getTotalNumBooks } from "../controllers/books.js";

const router = express.Router();

router.get("/:id", getBookDetails);
```

## 3. Catalog Routes (catalog.js)

- **Purpose:** Handles catalog browsing and searching functionalities.

- **Dependencies:**
  - `express`: For creating the router.
  - `../controllers/catalog.js`: Contains the route handler functions (getCatalog, searchCatalog).

- **Routes:**
    - `GET /`: Retrieves the entire catalog.
        - *Controller Function:* `getCatalog`
    - `POST /`: Searches the catalog based on provided search criteria.
        - *Controller Function:* `searchCatalog`

- **Snippet:**
```javascript
import express from "express";
import { getCatalog, searchCatalog } from "../controllers/catalog.js";

const router = express.Router();

router.get("/", getCatalog);
```

## 4. Fines Routes (fines.js)

- **Purpose:** Manages user fines, allowing retrieval of fines, fine details, and fine payments.

- **Dependencies:**
  - `express`: For creating the router.
  - `../controllers/fines.js`: Contains the route handler functions (getFinesByUser, getFineDetails, payFine).

- **Routes:**
    - `GET /user/:userId`: Retrieves all fines for a specific user, where `:userId` is the user's ID.
        - *Controller Function:* `getFinesByUser`
    - `GET /:fineId`: Retrieves details for a specific fine, where `:fineId` is the fine's ID.
        - *Controller Function:* `getFineDetails`
    - `POST /pay/:fineId`: Pays a specific fine, where `:fineId` is the fine's ID.
        - *Controller Function:* `payFine`

- **Snippet:**
```javascript
import express from "express";
import { getFinesByUser, getFineDetails, payFine } from "../controllers/fines.js";

const router = express.Router();

router.get("/user/:userId", getFinesByUser);
```

## 5. ISBN Routes (isbn.js)

- **Purpose:** Enables book management using ISBNs, including adding books and retrieving book details by ISBN.

- **Dependencies:**
  - `express`: For creating the router.
  - `../db/dbconn.js`: Establishes the database connection.
  - `../controllers/isbn.js`: Contains the route handler functions (addBookByISBN, getBookDetailsByISBN).

- **Routes:**
    - `POST /add`: Adds a new book to the library using its ISBN.
        - *Controller Function:* `addBookByISBN`
    - `GET /details/:id`: Retrieves details for a book using its ISBN, where `:id` is the ISBN.
        - *Controller Function:* `getBookDetailsByISBN`

- **Snippet:**
```javascript
import express from "express";
import { connectDB } from "../db/dbconn.js";
import { addBookByISBN, getBookDetailsByISBN } from "../controllers/isbn.js";

const router = express.Router();

router.post("/add", addBookByISBN);
```

## 6. Issues Routes (issues.js)

- **Purpose:** Manages book issues and returns, tracking active and past issues, and providing issue history.

- **Dependencies:**
  - `express`: For creating the router.
  - `../db/dbconn.js`: Establishes the database connection.
  - `../controllers/issues.js`: Contains the route handler functions (getActiveIssuesByUid, getPastIssuesByUid, createIssue, returnBook, getTotalNumIssues, getIssueHistory).

- **Routes:**
    - `GET /active/:uid`: Retrieves all currently active issues for a specific user, where `:uid` is the user's ID.
        - *Controller Function:* `getActiveIssuesByUid`
    - `GET /past/:uid`: Retrieves all past (returned) issues for a specific user, where `:uid` is the user's ID.
        - *Controller Function:* `getPastIssuesByUid`
    - `POST /`: Creates a new book issue.
        - *Controller Function:* `createIssue`
    - `PATCH /:book_id/return`: Marks a book as returned, where `:book_id` is the book's ID.
        - *Controller Function:* `returnBook`
    - `GET /total-issues`: Retrieves the total number of book issues.
        - *Controller Function:* `getTotalNumIssues`
	- `GET /issue-history`: Retrieves the history of book issues.
        - *Controller Function:* `getIssueHistory`

- **Snippet:**
```javascript
import express from "express"
import { connectDB } from "../db/dbconn.js"
import { getActiveIssuesByUid, getPastIssuesByUid, createIssue, returnBook, getTotalNumIssues, getIssueHistory } from "../controllers/issues.js"

const router = express.Router();

router.get("/active/:uid", getActiveIssuesByUid);
```

## 7. Members Routes (members.js)

- **Purpose:** Provides member-related statistics and information.

- **Dependencies:**
  - `express`: For creating the router.
  - `../controllers/members.js`: Contains the route handler function (getNumMembers).
  - `../db/dbconn.js`: Establishes the database connection.

- **Routes:**
    - `GET /num-members`: Retrieves the total number of library members.
        - *Controller Function:* `getNumMembers`

- **Snippet:**
```javascript
import express from "express"
import { getNumMembers } from "../controllers/members.js";
import { connectDB } from "../db/dbconn.js"

const router = express.Router();

router.get("/num-members", getNumMembers);
```

## 8. Reservations Routes (reservations.js)

- **Purpose:** Manages book reservations, allowing users to create, retrieve, and cancel reservations.

- **Dependencies:**
  - `express`: For creating the router.
  - `../db/dbconn.js`: Establishes the database connection.
  - `../controllers/reservations.js`: Contains the route handler functions (createReservation, getReservationsByUid, cancelReservation).

- **Routes:**
    - `POST /`: Creates a new book reservation.
        - *Controller Function:* `createReservation`
    - `GET /:uid`: Retrieves all reservations for a specific user, where `:uid` is the user's ID.
        - *Controller Function:* `getReservationsByUid`
    - `DELETE /cancel/:reservation_id`: Cancels a specific reservation, where `:reservation_id` is the reservation's ID.
        - *Controller Function:* `cancelReservation`

- **Snippet:**
```javascript
import express from "express";
import { connectDB } from "../db/dbconn.js"
import { createReservation, getReservationsByUid, cancelReservation } from "../controllers/reservations.js"

const router = express.Router();

router.post("/", createReservation);
```

# Dependencies

- **express:** Web application framework for Node.js.
- **../controllers/\*.js:** These modules contain the route handler functions, implementing the business logic for each endpoint. The specific functions are listed under each route definition.
- **../db/dbconn.js:** This module handles the database connection. It's assumed to export a `connectDB` function that establishes the connection.

# Assumptions

- The `../controllers/*.js` files contain the actual implementations of the route handling logic.
- `../db/dbconn.js` correctly establishes a database connection required by several routes.
- Request bodies and parameters are handled and validated within the controller functions.
- Error handling and response formatting are implemented within the controller functions.