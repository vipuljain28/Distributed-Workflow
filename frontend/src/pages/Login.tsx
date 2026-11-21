import { useState } from "react";
import { api } from "../api/client";

export default function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const login = async () => {
        try {
            const res = await api.post("/auth/login", { email, password });
            if (res.data.accessToken || res.data.message === "Logged in") {
                localStorage.setItem("token", res.data.accessToken);
                window.location.href = "/workflows";
            } else {
                alert(res.data.message || "Login failed");
            }
        } catch (err: any) {
            alert(err.response?.data?.message || err.message || "Login failed");
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
            <div className="bg-white p-6 rounded shadow w-80">
                <h2 className="text-xl font-bold mb-4">Login</h2>
                <input className="border p-2 w-full mb-3"
                    placeholder="Email"
                    onChange={e => setEmail(e.target.value)}
                />
                <input className="border p-2 w-full mb-3"
                    type="password"
                    placeholder="Password"
                    onChange={e => setPassword(e.target.value)}
                />
                <button onClick={login}
                    className="bg-blue-600 text-white w-full py-2 rounded">
                    Login
                </button>
                <p className="text-sm mt-3 text-center">
                    New user?{" "}
                    <a href="/signup" className="text-blue-600 underline">
                        Sign up
                    </a>
                </p>

            </div>
        </div>
    );
}
