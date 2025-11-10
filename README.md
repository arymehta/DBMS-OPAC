# COEP OPAC System - Open Public Access Catalog

##  Entity Tables

###  `USERS`

Stores details of all system users.

| Column | Type | Constraints | Description |
|--------|------|--------------|-------------|
| `uid` | `SERIAL` | `PRIMARY KEY` | Unique user ID. |
| `name` | `VARCHAR(255)` | `NOT NULL` | Full name of the user. |
| `email` | `VARCHAR(255)` | `UNIQUE NOT NULL` | User's email address (login). |
| `password_hash` | `TEXT` | `NOT NULL` | Encrypted password. |
| `is_verified` | `BOOLEAN` | `DEFAULT FALSE` | Whether the email is verified. |
| `books_issued` | `INT` | `DEFAULT 0` | Number of currently issued books. |
| `role` | `VARCHAR(10)` | `CHECK (role IN ('ISSUER','ADMIN')) DEFAULT 'ISSUER'` | Defines user type. |
| `created_at` | `TIMESTAMP` | `DEFAULT CURRENT_TIMESTAMP` | When the user was created. |
| `updated_at` | `TIMESTAMP` | `DEFAULT CURRENT_TIMESTAMP` | When user info was last updated. |

---

### `ISSUER_DETAILS`

Holds additional configuration for users with the **ISSUER** role.

| Column | Type | Constraints | Description |
|--------|------|--------------|-------------|
| `uid` | `INT` | `PRIMARY KEY REFERENCES USERS(uid) ON DELETE CASCADE` | Links to the user. |
| `max_books_allowed` | `INT` | `DEFAULT 5` | Maximum number of books that can be issued. |
| `penalty_rate` | `DECIMAL(5,2)` | `DEFAULT 2.00` | Fine rate per overdue day. |

---

###  `ADMIN_DETAILS`

Holds configuration and permissions for **ADMIN** users.

| Column | Type | Constraints | Description |
|--------|------|--------------|-------------|
| `uid` | `INT` | `PRIMARY KEY REFERENCES USERS(uid) ON DELETE CASCADE` | Links to the user. |
| `permissions` | `JSONB` | `DEFAULT '{"can_add_books": true, "can_delete_users": true}'` | Stores admin privileges. |

---

### `LIBRARY`

Represents a physical library branch.

| Column | Type | Constraints | Description |
|--------|------|--------------|-------------|
| `library_id` | `SERIAL` | `PRIMARY KEY` | Unique library ID. |
| `name` | `VARCHAR(255)` | `NOT NULL` | Library name. |
| `street` | `VARCHAR(255)` |  | Address line. |
| `city` | `VARCHAR(255)` |  | City. |
| `state` | `VARCHAR(255)` |  | State. |
| `zip_code` | `VARCHAR(20)` |  | Postal code. |
| `contact_number` | `VARCHAR(20)` |  | Library contact number. |
| `email` | `VARCHAR(255)` |  | Email for correspondence. |
| `opening_hours` | `VARCHAR(255)` |  | Opening hours info. |
| `closing_hours` | `VARCHAR(255)` |  | Closing hours info. |

---

### `ISBN`

Stores shared information about books identified by their ISBN.

| Column | Type | Constraints | Description |
|--------|------|--------------|-------------|
| `isbn_id` | `VARCHAR(17)` | `PRIMARY KEY` | ISBN identifier. |
| `title` | `VARCHAR(255)` | `NOT NULL` | Book title. |
| `author` | `VARCHAR(255)` | `NOT NULL` | Book author. |
| `genre` | `VARCHAR(255)` |  | Genre or category. |
| `publication` | `VARCHAR(255)` |  | Publisher name. |
| `lang` | `VARCHAR(255)` | `NOT NULL` | Language of the book. |
| `pages` | `INT` | `CHECK(pages > 0)` | Number of pages. |
| `doc_type` | `VARCHAR(255)` |  | Type of document (e.g., "Book", "Magazine"). |

---

### `BOOKS`

Represents each **physical copy** of a book.

| Column | Type | Constraints | Description |
|--------|------|--------------|-------------|
| `book_id` | `SERIAL` | `PRIMARY KEY` | Unique book copy ID. |
| `status` | `VARCHAR(10)` | `CHECK (status IN ('ISSUED', 'AVAILABLE')) DEFAULT 'AVAILABLE'` | Availability status. |
| `dewey_dec_loc` | `VARCHAR(255)` |  | Dewey Decimal classification. |
| `isbn_id` | `VARCHAR(17)` | `NOT NULL REFERENCES ISBN(isbn_id) ON DELETE RESTRICT ON UPDATE RESTRICT` | ISBN reference. |

---

###  `CATALOG`

Links **books** to their **library** — a one-to-many relationship.

| Column | Type | Constraints | Description |
|--------|------|--------------|-------------|
| `library_id` | `INT` | `NOT NULL REFERENCES LIBRARY(library_id) ON DELETE CASCADE ON UPDATE CASCADE` | Library reference. |
| `book_id` | `INT` | `NOT NULL REFERENCES BOOKS(book_id) ON DELETE CASCADE ON UPDATE CASCADE` | Book reference. |
| **Primary Key** | `(book_id, library_id)` |  | Ensures uniqueness per library. |

---

### `ISSUES`

Tracks book issuance records — which book, which user, and for how long.

| Column | Type | Constraints | Description |
|--------|------|--------------|-------------|
| `issue_id` | `SERIAL` | `PRIMARY KEY` | Unique issue record. |
| `book_id` | `INT` | `NOT NULL` | Reference to the book issued. |
| `library_id` | `INT` | `NOT NULL` | Reference to the library. |
| `uid` | `INT` | `NOT NULL REFERENCES USERS(uid) ON UPDATE CASCADE ON DELETE RESTRICT` | The user who issued it. |
| `issued_on` | `DATE` | `NOT NULL` | Issue date. |
| `due_date` | `DATE` | `NOT NULL` | Due return date. |
| `status` | `VARCHAR(20)` | `DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE','RETURNED'))` | Issue status. |

**Foreign Keys:**
- `(book_id, library_id)` → `CATALOG(book_id, library_id)`
- `book_id` → `BOOKS(book_id)`
- `library_id` → `LIBRARY(library_id)`
- `uid` → `USERS(uid)`

---

### `FINE`

Stores fines associated with delayed book returns.

| Column | Type | Constraints | Description |
|--------|------|--------------|-------------|
| `fine_id` | `SERIAL` | `PRIMARY KEY` | Unique fine record ID. |
| `issue_id` | `INT` | `NOT NULL REFERENCES ISSUES(issue_id) ON UPDATE CASCADE ON DELETE CASCADE` | The issue related to this fine. |
| `amount` | `DECIMAL(4,2)` | `DEFAULT 0.0` | Fine amount. |
| `paid_status` | `BOOLEAN` | `DEFAULT FALSE` | Whether fine is paid. |
| `paid_date` | `DATE` |  | When fine was paid. |
| `sbi_dtu` | `VARCHAR(50)` |  | Payment reference ID. |
| `reason` | `VARCHAR(255)` |  | Reason for fine (e.g., “Late return”). |

---

### `RESERVATIONS`

Allows users to **reserve or waitlist** books (based on ISBN).

| Column | Type | Constraints | Description |
|--------|------|--------------|-------------|
| `reservation_id` | `SERIAL` | `PRIMARY KEY` | Unique reservation record. |
| `isbn_id` | `VARCHAR(17)` | `NOT NULL REFERENCES ISBN(isbn_id) ON UPDATE CASCADE ON DELETE RESTRICT` | Book ISBN reserved. |
| `library_id` | `INT` | `NOT NULL REFERENCES LIBRARY(library_id) ON UPDATE CASCADE ON DELETE RESTRICT` | Library branch. |
| `uid` | `INT` | `NOT NULL REFERENCES USERS(uid) ON UPDATE CASCADE ON DELETE RESTRICT` | User who reserved the book. |
| `expires_at` | `TIMESTAMP` | `DEFAULT NULL` | Expiry of reservation (if active). |
| `status` | `VARCHAR(10)` | `CHECK (status IN ('RESERVED','WAITLISTED')) DEFAULT 'WAITLISTED'` | Reservation status. |

---

### `OTP`

Stores OTPs for user verification and password resets.

| Column | Type | Constraints | Description |
|--------|------|--------------|-------------|
| `otp_id` | `UUID` | `PRIMARY KEY DEFAULT gen_random_uuid()` | Unique OTP identifier. |
| `uid` | `INT` | `REFERENCES USERS(uid) ON DELETE CASCADE` | Associated user. |
| `otp_hash` | `TEXT` | `NOT NULL` | Hashed OTP value. |
| `purpose` | `VARCHAR(20)` | `CHECK (purpose IN ('SIGNUP','RESET_PASSWORD')) NOT NULL` | OTP usage purpose. |
| `expires_at` | `TIMESTAMPTZ` | `NOT NULL` | Expiry timestamp (UTC). |
| `verified` | `BOOLEAN` | `DEFAULT FALSE` | Whether OTP has been used. |
| `created_at` | `TIMESTAMPTZ` | `DEFAULT (CURRENT_TIMESTAMP AT TIME ZONE 'UTC')` | Creation time. |

---

## Relationships Summary

| Relationship | Type | Description |
|---------------|------|-------------|
| USERS → ISSUER_DETAILS | 1:1 | Each issuer user has one issuer details record. |
| USERS → ADMIN_DETAILS | 1:1 | Each admin user has one admin details record. |
| LIBRARY → BOOKS → ISBN | 1:N | Each library has many books, each book linked to an ISBN. |
| CATALOG(library_id, book_id) | Associative | Connects each physical book to a library. |
| ISSUES → USERS, BOOKS, LIBRARY | N:1 | Each issue belongs to one user, one book, one library. |
| FINE → ISSUES | 1:1 | Each fine is tied to a specific issue. |
| RESERVATIONS → USERS, LIBRARY, ISBN | N:1 | A user can reserve books per library per ISBN. |
| OTP → USERS | 1:N | A user can have multiple OTP records. |

---


## Database Diagram 
![alt text](OPAC-DB-Diag-1.png)