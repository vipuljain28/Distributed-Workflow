#!/bin/bash
set -e

BASE_URL="http://localhost:4000"

EMAIL="vipul@example.com"
PASSWORD="secret123"
NAME="Vipul Demo User"
USER_ID="cmiure0ey0000ftps35p6k96r"
echo "=============================="
echo "  SIGNUP"
echo "=============================="

SIGNUP_RESP=$(curl -s -X POST "$BASE_URL/auth/register" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$EMAIL\",\"password\":\"$PASSWORD\",\"name\":\"$NAME\"}")
echo "$SIGNUP_RESP"
USER_ID=$(echo "$SIGNUP_RESP" | jq -r '.user.id // empty')

if [[ -z "$USER_ID" ]]; then
  echo "User already exists. Skipping signup."
else
  echo "Signup successful. User ID: $USER_ID"
fi


echo "=============================="
echo "  LOGIN"
echo "=============================="

LOGIN_RESP=$(curl -s -X POST "$BASE_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$EMAIL\",\"password\":\"$PASSWORD\"}")

ACCESS_TOKEN=$(echo "$LOGIN_RESP" | jq -r '.accessToken')

if [[ "$ACCESS_TOKEN" == "null" || -z "$ACCESS_TOKEN" ]]; then
  echo "❌ Login Failed"
  exit 1
fi

echo "Access Token:"
echo "$ACCESS_TOKEN"
echo ""


AUTH_HEADER="Authorization: Bearer $ACCESS_TOKEN"


echo "=============================="
echo "  CREATE WORKFLOW"
echo "=============================="

WF_RESP=$(curl -s -X POST "$BASE_URL/workflow" \
  -H "$AUTH_HEADER" \
  -H "Content-Type: application/json" \
  -d "{\"name\":\"Demo Workflow\",\"description\":\"Full Flow Demo\"}")

WF_ID=$(echo "$WF_RESP" | jq -r '.workflow.id')

echo "Workflow ID: $WF_ID"


echo "=============================="
echo "  ADD NODES"
echo "=============================="

# START Node
START_RESP=$(curl -s -X POST "$BASE_URL/workflow/$WF_ID/nodes" \
  -H "$AUTH_HEADER" \
  -H "Content-Type: application/json" \
  -d "{\"name\":\"Start\",\"type\":\"START\",\"position\":1}")
  echo "$START_RESP"
  START_ID=$(echo "$START_RESP" | jq -r '.node.id')
echo "START ID: $START_ID"

# SLACK Node
SLACK_ID=$(curl -s -X POST "$BASE_URL/workflow/$WF_ID/nodes" \
  -H "$AUTH_HEADER" \
  -H "Content-Type: application/json" \
  -d "{
        \"name\":\"Slack Step\",
        \"type\":\"SLACK\",
        \"config\":{
            \"webhookUrl\":\"https://hooks.slack.com/services/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\",
            \"message\":\"Workflow reached Slack!\"
        },
        \"position\":2}" | jq -r '.node.id')

echo "SLACK ID: $SLACK_ID"

# SHEETS Node
SHEETS_ID=$(curl -s -X POST "$BASE_URL/workflow/$WF_ID/nodes" \
  -H "$AUTH_HEADER" \
  -H "Content-Type: application/json" \
  -d "{
        \"name\":\"Sheets Step\",
        \"type\":\"SHEETS\",
        \"config\":{
            \"sheetUrl\":\"https://api.sheety.co/89671c5cfd680d0cfe1ee1deb451ddc8/demoWorkflowSheet/sheet1\",
            \"row\":{\"status\":\"done\",\"user\":\"Vipul\",\"ts\":\"$(date)\"}
        },
        \"position\":3
      }" | jq -r '.node.id')
echo "SHEETS ID: $SHEETS_ID"

# END Node
END_ID=$(curl -s -X POST "$BASE_URL/workflow/$WF_ID/nodes" \
  -H "$AUTH_HEADER" \
  -H "Content-Type: application/json" \
  -d "{\"name\":\"End\",\"type\":\"END\",\"position\":4}" \
  | jq -r '.node.id')
echo "END ID: $END_ID"


echo "=============================="
echo "  ADD EDGES"
echo "=============================="

curl -s -X POST "$BASE_URL/workflow/$WF_ID/nodes/$START_ID/edges" \
  -H "$AUTH_HEADER" \
  -H "Content-Type: application/json" \
  -d "{\"fromNodeId\":\"$START_ID\",\"toNodeId\":\"$SLACK_ID\"}" > /dev/null
echo "START → SLACK"

curl -s -X POST "$BASE_URL/workflow/$WF_ID/nodes/$SLACK_ID/edges" \
  -H "$AUTH_HEADER" \
  -H "Content-Type: application/json" \
  -d "{\"fromNodeId\":\"$SLACK_ID\",\"toNodeId\":\"$SHEETS_ID\"}" > /dev/null
echo "SLACK → SHEETS"

curl -s -X POST "$BASE_URL/workflow/$WF_ID/nodes/$SHEETS_ID/edges" \
  -H "$AUTH_HEADER" \
  -H "Content-Type: application/json" \
  -d "{\"fromNodeId\":\"$SHEETS_ID\",\"toNodeId\":\"$END_ID\"}" > /dev/null
echo "SHEETS → END"


echo "=============================="
echo "  RUN WORKFLOW"
echo "=============================="

RUN_ID=$(curl -s -X POST "$BASE_URL/workflow/$WF_ID/run" \
  -H "$AUTH_HEADER" \
  -H "Content-Type: application/json" \
  -d "{\"input\":{\"user\":\"Vipul\",\"level\":99}}" \
  | jq -r '.id')

echo "Workflow Run Started: $RUN_ID"

echo "=============================="
echo "  DEMO COMPLETE 🎉"
echo "=============================="
