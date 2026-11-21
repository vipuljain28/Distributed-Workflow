import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import WorkflowList from "./pages/WorkflowList";
import WorkflowBuilder from "./pages/WorkflowBuilder";
import Guides from "./pages/Guides";
import Approvals from "./pages/Approvals";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/workflows" element={<WorkflowList />} />
        <Route path="/workflow/:id" element={<WorkflowBuilder />} />
        <Route path="/guides" element={<Guides />} />
        <Route path="/approvals" element={<Approvals />} />
      </Routes>
    </BrowserRouter>
  );
}
