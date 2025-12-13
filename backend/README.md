
# Distributed Workflow Engine – Backend

## Overview

This project is a **distributed, event-driven workflow execution engine**, inspired by platforms like **Zapier, n8n, and Temporal**.

It allows users to define workflows as **Directed Acyclic Graphs (DAGs)** composed of nodes and edges, where:

* Nodes represent executable tasks (HTTP, Slack, Sheets, Email, etc.)
* Edges represent execution flow
* Conditions enable branching logic
* Execution is asynchronous, scalable, and fault-tolerant

The system is designed to **decouple orchestration from execution**, ensuring reliability and horizontal scalability.

---

## Key Features

### Core Capabilities

* JWT-based authentication (ADMIN, CREATOR)
* Workflow CRUD
* DAG-based workflow execution
* Asynchronous processing using queues
* Retry policy per node
* Conditional branching using expressions
* Scheduled workflows (cron)
* Execution history persistence
* Fully testable execution engine

### Supported Node Types

* START
* ACTION
* HTTP
* CONDITION
* DELAY
* EMAIL
* SLACK
* SHEETS
* END

---

## High-Level Architecture

### Components

```
Client
  |
  | REST API
  v
API Server (Express + TypeScript)
  |
  | DB (metadata)
  v
PostgreSQL (Prisma)
  |
  | enqueue
  v
Redis (BullMQ)
  |
  | Workers
  v
Workflow Engine
```

---

## Queue & Worker Design

### Queues

| Queue Name     | Responsibility            |
| -------------- | ------------------------- |
| `workflow_run` | Starts workflow execution |
| `node_execute` | Executes individual nodes |

---

### Workers

#### 1. Workflow Worker

* Discovers START node
* Creates WorkflowRun
* Enqueues first node into `node_execute`

#### 2. Node Worker

* Executes a node
* Persists NodeRun
* Evaluates outgoing edges
* Applies conditions
* Enqueues next node(s)

---

## Execution Flow (End-to-End)

```
Workflow Run Triggered
        ↓
Workflow Worker
        ↓
START Node Identified
        ↓
Node Worker Executes Node
        ↓
Node Output Saved
        ↓
Edges Evaluated
   ├── Condition = true → Next node
   └── Condition = false → Skip
        ↓
END Node Reached
        ↓
WorkflowRun Marked COMPLETE
```

---

## Node Configuration (Demo-Ready JSON)

Below are **exact JSON configs** supported by the engine.

---

### ACTION Node

Used for data transformation or custom logic.

```json
{
  "script": "return { result: input.value * 2 };"
}
```

---

### HTTP Node

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

### CONDITION Node (Expression-based)

```json
{
  "expression": "output.status === 200"
}
```

Uses **JEXL** and is evaluated against:

* `input`
* `output`

---

### DELAY Node

```json
{
  "delayMs": 5000
}
```

---

### EMAIL Node

```json
{
  "to": "user@example.com",
  "subject": "Workflow Completed",
  "body": "Your workflow has finished successfully."
}
```

---

## SHEETS Node Variants

### 1. Sheety / No-Code API (Fallback)

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

### 2. Google Sheets – Service Account (READ)

```json
{
  "mode": "read",
  "sheetId": "1AbcDEFghiJKL",
  "range": "Sheet1!A1:C10"
}
```

---

### 3. Google Sheets – Service Account (APPEND)

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

## SLACK Node Variants

### 1. Slack Webhook

```json
{
  "webhookUrl": "https://hooks.slack.com/services/T000/B000/XXXX",
  "message": "Workflow completed successfully"
}
```

---

### 2. Slack Bot Token – New Message

```json
{
  "token": "xoxb-XXXX",
  "channel": "#general",
  "message": "Workflow finished"
}
```

---

### 3. Slack Bot Token – Thread Reply

```json
{
  "token": "xoxb-XXXX",
  "channel": "#general",
  "message": "Follow-up message",
  "threadTs": "1712345678.123456"
}
```

---

## Retry & Failure Handling

* Retry count configurable per node
* Node failures do **not crash workflow**
* Failed nodes are recorded with error details
* Workflow continues only when valid edges exist

---

## API Overview

| Method | Endpoint            | Description                 |
| ------ | ------------------- | --------------------------- |
| POST   | `/auth/register`    | User signup                 |
| POST   | `/auth/login`       | Login                       |
| GET    | `/workflow`         | List workflows (role-aware) |
| POST   | `/workflow`         | Create workflow             |
| DELETE | `/workflow/:id`     | Delete workflow             |
| POST   | `/workflow/:id/run` | Run workflow                |
| GET    | `/run/:id`          | Workflow run status         |

---

## Installation & Setup

### Prerequisites

* Node.js 18+
* Docker
* Redis
* PostgreSQL

---

### 1. Install Dependencies

```bash
npm install
```

---

### 2. Start Infrastructure

```bash
docker-compose up -d
```

---

### 3. Database Setup

```bash
npx prisma migrate dev
npx prisma generate
```

---

### 4. Start API Server

```bash
npm run dev
```

---

### 5. Start Workers

```bash
npm run worker:workflow
npm run worker:node
```

---

## Testing

### Run Unit Tests

```bash
npm test
```

Tests cover:

* DAG traversal
* Condition evaluation
* Node execution
* Retry logic

---

## Demo Workflow (Recommended)

**Demo Scenario**

1. HTTP → fetch status
2. CONDITION → status == 200
3. SHEETS → append result
4. SLACK → notify channel
5. END

This demonstrates:

* Async execution
* Branching
* External integrations
* Persistence

---

## Design Principles

* **Separation of concerns**
* **Queue-driven orchestration**
* **Idempotent execution**
* **Horizontal scalability**
* **Fail-safe execution**

---

## Why This Architecture?

> “The engine separates orchestration from execution using queues, allowing reliable, distributed workflow processing with retry and branching support.”

This mirrors real-world systems like:

* Temporal
* AWS Step Functions
* Zapier backend


# API Reference – Request & Response

All APIs are **REST-based**, secured using **JWT authentication**.

**Base URL**

```
http://localhost:4000
```

**Auth Header (required for protected routes)**

```
Authorization: Bearer <JWT_TOKEN>
```

---

## Authentication APIs

### Register User

**POST** `/auth/register`

#### Request

```json
{
  "name": "Vipul Jain",
  "email": "vipul@example.com",
  "password": "password123"
}
```

#### Response

```json
{
  "message": "User registered successfully"
}
```

---

### Login

**POST** `/auth/login`

#### Request

```json
{
  "email": "vipul@example.com",
  "password": "password123"
}
```

#### Response

```json
{
  "message": "Logged in",
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

---

## Workflow APIs

### List Workflows (Role Aware)

**GET** `/workflow`

* **ADMIN** → all workflows
* **CREATOR** → only own workflows

#### Response

```json
[
  {
    "id": "wf_123",
    "name": "Demo Workflow",
    "ownerId": "user_1",
    "createdAt": "2025-01-01T10:00:00Z"
  }
]
```

---

### Create Workflow

**POST** `/workflow`

#### Request

```json
{
  "name": "New Workflow"
}
```

#### Response

```json
{
  "message": "Workflow created",
  "workflow": {
    "id": "wf_456",
    "name": "New Workflow",
    "ownerId": "user_1"
  }
}
```

---

### Get Workflow (Full Graph)

**GET** `/workflow/:workflowId`

#### Response

```json
{
  "id": "wf_456",
  "name": "New Workflow",
  "nodes": [],
  "edges": [],
  "conditions": []
}
```

---

### Delete Workflow

**DELETE** `/workflow/:workflowId`

#### Response

```json
{
  "message": "Workflow deleted"
}
```

---

## Node APIs

### Create Node

**POST** `/workflow/:workflowId/nodes`

#### Request

```json
{
  "name": "HTTP Request",
  "type": "HTTP",
  "position": 1,
  "config": {
    "method": "GET",
    "url": "https://api.example.com"
  }
}
```

#### Response

```json
{
  "id": "node_1",
  "workflowId": "wf_456",
  "type": "HTTP"
}
```

---

### Delete Node

**DELETE** `/nodes/:nodeId`

#### Response

```json
{
  "message": "Node deleted"
}
```

---

## Edge APIs

### Create Edge

**POST** `/workflow/:workflowId/nodes/:fromNodeId/edges`

#### Request

```json
{
  "toNodeId": "node_2",
  "conditionId": "cond_1"
}
```

#### Response

```json
{
  "id": "edge_1",
  "fromNodeId": "node_1",
  "toNodeId": "node_2",
  "conditionId": "cond_1"
}
```

---

### Delete Edge

**DELETE** `/edges/:edgeId`

#### Response

```json
{
  "message": "Edge deleted"
}
```

---

## Condition APIs

### Create Condition

**POST** `/workflow/:workflowId/conditions`

#### Request

```json
{
  "name": "HTTP Success",
  "type": "EXPRESSION",
  "params": {
    "expression": "output.status == 200"
  }
}
```

#### Response

```json
{
  "id": "cond_1",
  "workflowId": "wf_456",
  "type": "EXPRESSION"
}
```

---

### Delete Condition

**DELETE** `/conditions/:conditionId`

#### Response

```json
{
  "message": "Condition deleted"
}
```

---

## Workflow Execution APIs

### Run Workflow

**POST** `/workflow/:workflowId/run`

#### Request

```json
{
  "input": {
    "orderId": 123,
    "amount": 500
  }
}
```

#### Response

```json
{
  "id": "run_789",
  "status": "QUEUED"
}
```

---

### Get Workflow Run Status

**GET** `/run/:runId`

#### Response

```json
{
  "id": "run_789",
  "workflowId": "wf_456",
  "status": "COMPLETED",
  "startedAt": "2025-01-01T10:05:00Z",
  "finishedAt": "2025-01-01T10:05:10Z"
}
```

---

## Node Run Tracking (Internal)

Each node execution is persisted with:

```json
{
  "id": "node_run_1",
  "nodeId": "node_1",
  "status": "SUCCESS",
  "input": {},
  "output": {
    "status": 200
  },
  "error": null
}
```

---

## Error Response Format (Standard)

```json
{
  "message": "Not allowed"
}
```

or

```json
{
  "message": "Validation failed"
}
```

---

## Execution Guarantees

* Each node is executed **exactly once per workflow run**
* Retries are isolated to node level
* Failures do not crash the workflow engine
* Execution order is strictly DAG-driven

---

## Testing Commands

```bash
npm test
```

```bash
npm run worker:workflow
npm run worker:node
```
