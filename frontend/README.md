---
# Workflow Engine – Frontend (React)

## Overview

This is a **minimal, functional frontend** for the **Distributed Workflow Engine** backend.

The frontend is intentionally **simple and utilitarian**, designed to:

* Create workflows
* Add nodes, conditions, and edges
* Trigger workflow execution
* Observe execution status

---

## Tech Stack

* **React 18**
* **TypeScript (strict)**
* **Vite**
* **React Router**
* **Axios**
* **Tailwind CSS**

---

## Core Features

### Authentication

* User signup
* Login with JWT
* Token stored in `localStorage`
* Automatic redirect to login on `401 Unauthorized`

---

### Workflow Management

* List workflows (role-aware)

  * ADMIN → all workflows
  * CREATOR → own workflows only
* Create new workflow
* Delete workflow

---

### Workflow Builder

For a selected workflow, the UI allows:

#### Nodes

* Create nodes with:

  * Type selection
  * Editable JSON config
  * Execution position
* Supported node types:

  * START
  * ACTION
  * HTTP
  * CONDITION
  * DELAY
  * EMAIL
  * SLACK
  * SHEETS
  * END


#### Edges

* Connect nodes using edges
* Optional condition per edge
* Conditional branching supported

---

### Workflow Execution

* Run workflow with JSON input
* Poll workflow run status
* Display run status (QUEUED / RUNNING / COMPLETED / FAILED)

---

## Application Routes

| Route           | Description      |
| --------------- | ---------------- |
| `/`             | Login            |
| `/signup`       | Signup           |
| `/workflows`    | Workflow list    |
| `/workflow/:id` | Workflow builder |

---

## API Integration

All API communication is done via Axios.

### Axios Client

* Base URL: `http://localhost:4000`
* Automatically attaches JWT token
* Redirects to login on `401`

```ts
api.interceptors.response.use(
  res => res,
  err => {
    if (err.response?.status === 401) {
      localStorage.removeItem("token");
      window.location.href = "/";
    }
    return Promise.reject(err);
  }
);
```

---

## Node Configuration Examples (Frontend)

Each node uses **raw JSON configuration**, allowing flexibility and backend parity.

### ACTION

```json
{
  "script": "return { total: input.amount * 2 }"
}
```

---

### HTTP

```json
{
  "method": "GET",
  "url": "https://api.example.com/status",
  "headers": {
    "Authorization": "Bearer token"
  },
  "timeout": 5000
}
```

---

### CONDITION

```json
{
  "expression": "output.status === 200"
}
```

---

### DELAY

```json
{
  "delayMs": 3000
}
```

---

### EMAIL

```json
{
  "to": "user@example.com",
  "subject": "Workflow Completed",
  "body": "Execution finished successfully"
}
```

---

### SHEETS – Sheety / NoCode API

```json
{
  "fallbackUrl": "https://api.sheety.co/project/sheet",
  "row": {
    "name": "Vipul",
    "status": "SUCCESS"
  }
}
```

---

### SHEETS – Service Account (READ)

```json
{
  "mode": "read",
  "sheetId": "1AbcDEFghiJKL",
  "range": "Sheet1!A1:C10"
}
```

---

### SHEETS – Service Account (APPEND)

```json
{
  "mode": "append",
  "sheetId": "1AbcDEFghiJKL",
  "range": "Sheet1!A1",
  "row": {
    "email": "test@example.com",
    "status": "DONE"
  }
}
```

---

### SLACK – Webhook

```json
{
  "webhookUrl": "https://hooks.slack.com/services/T000/B000/XXXX",
  "message": "Workflow completed"
}
```

---

### SLACK – Bot Token (New Message)

```json
{
  "token": "xoxb-XXXX",
  "channel": "#general",
  "message": "Workflow finished"
}
```

---

### SLACK – Bot Token (Thread Reply)

```json
{
  "token": "xoxb-XXXX",
  "channel": "#general",
  "message": "Follow-up message",
  "threadTs": "1712345678.123456"
}
```

---

## Installation & Setup

### Prerequisites

* Node.js 18+
* Backend running on port `4000`

---

### Install Dependencies

```bash
npm install
```

---

### Start Development Server

```bash
npm run dev
```

Frontend runs on:

```
http://localhost:5173
```

---

## Development Notes

* No drag-and-drop editor by design (Will Work in Future)
* JSON-first approach for node configs (Will replace with drag-and-drop in Future with front end form for each type of node)
* UI reflects backend capabilities directly for Project demostrational purpose

---

## Demo Flow (Recommended)

1. Login as CREATOR
2. Create workflow
3. Add:

   * HTTP node
   * CONDITION
   * SHEETS
   * SLACK
4. Connect nodes using edges
5. Run workflow
6. Show execution status

---

## Design Philosophy

> “The frontend is intentionally minimal to keep focus on the distributed execution engine rather than UI complexity.”

This aligns with real-world internal tooling and backend-heavy systems.

---