#!/bin/bash

BASE_URL="http://localhost:4000"
EMAIL="demo@flow.com"
PASSWORD="password123"

echo "🔐 Logging in..."

LOGIN=$(curl -s -X POST "$BASE_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$EMAIL\",\"password\":\"$PASSWORD\"}")

TOKEN=$(echo $LOGIN | jq -r '.accessToken')

if [ "$TOKEN" == "null" ]; then
  echo "❌ Login failed"
  exit 1
fi

AUTH="Authorization: Bearer $TOKEN"
echo "✅ Logged in"

# ---------------- CREATE WORKFLOW ----------------

WF=$(curl -s -X POST "$BASE_URL/workflow" \
  -H "$AUTH" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Service Account + Bot Token Demo",
    "description": "End-to-end workflow demo"
  }')

WF_ID=$(echo $WF | jq -r '.workflow.id')
echo "📦 Workflow ID: $WF_ID"

# ---------------- CREATE NODE HELPER ----------------

create_node () {
  curl -s -X POST "$BASE_URL/workflow/$WF_ID/nodes" \
    -H "$AUTH" \
    -H "Content-Type: application/json" \
    -d "$1" | jq -r '.node.id'
}

# ---------------- NODES ----------------

START=$(create_node '{
  "name":"Start",
  "type":"START",
  "position":1
}')

HTTP=$(create_node '{
  "name":"Fetch Todo",
  "type":"HTTP",
  "position":2,
  "config":{
    "method":"GET",
    "url":"https://jsonplaceholder.typicode.com/todos/1",
    "timeoutMs":5000
  }
}')

COND=$(create_node '{
  "name":"Check HTTP 200",
  "type":"CONDITION",
  "position":3,
  "config":{
    "expression":"output.status == 200"
  }
}')

SHEET=$(create_node '{
  "name":"Append Sheet Row",
  "type":"SHEETS",
  "position":4,
  "config":{
    "sheetId":"YOUR_SHEET_ID",
    "range":"Sheet1!A:C",
    "mode":"append",
    "row":{
      "event":"Workflow success",
      "status":"OK",
      "source":"Flow Engine"
    }
  }
}')

SLACK_MSG=$(create_node '{
  "name":"Slack Message",
  "type":"SLACK",
  "position":5,
  "config":{
    "token":"'"$SLACK_BOT_TOKEN"'",
    "channel":"'"$SLACK_CHANNEL_ID"'",
    "message":"🚀 Workflow executed successfully"
  }
}')

SLACK_THREAD=$(create_node '{
  "name":"Slack Thread Reply",
  "type":"SLACK",
  "position":6,
  "config":{
    "token":"'"$SLACK_BOT_TOKEN"'",
    "channel":"'"$SLACK_CHANNEL_ID"'",
    "threadTs":"{{output.ts}}",
    "message":"📎 This is a thread reply from Flow"
  }
}')

END=$(create_node '{
  "name":"End",
  "type":"END",
  "position":7
}')

# ---------------- CONDITION ----------------

COND_OBJ=$(curl -s -X POST "$BASE_URL/workflow/$WF_ID/conditions" \
  -H "$AUTH" \
  -H "Content-Type: application/json" \
  -d '{
    "name":"HTTP_OK",
    "type":"EXPRESSION",
    "params":{"expression":"output.status == 200"}
  }')

COND_ID=$(echo $COND_OBJ | jq -r '.condition.id')

# ---------------- EDGES ----------------

edge () {
  curl -s -X POST "$BASE_URL/workflow/$WF_ID/nodes/$1/edges" \
    -H "$AUTH" \
    -H "Content-Type: application/json" \
    -d "$2" > /dev/null
}

edge $START "{\"toNodeId\":\"$HTTP\"}"
edge $HTTP "{\"toNodeId\":\"$SHEET\",\"conditionId\":\"$COND_ID\"}"
edge $SHEET "{\"toNodeId\":\"$SLACK_MSG\"}"
edge $SLACK_MSG "{\"toNodeId\":\"$SLACK_THREAD\"}"
edge $SLACK_THREAD "{\"toNodeId\":\"$END\"}"

echo "🔗 Graph built"

# ---------------- RUN ----------------

RUN=$(curl -s -X POST "$BASE_URL/workflow/$WF_ID/run" \
  -H "$AUTH" \
  -H "Content-Type: application/json" \
  -d '{"demo":true}')

RUN_ID=$(echo $RUN | jq -r '.id')

echo "🚀 Workflow started"
echo "Run ID: $RUN_ID"
