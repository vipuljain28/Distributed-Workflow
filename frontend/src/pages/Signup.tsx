import { useState } from "react";
import { api } from "../api/client";

export default function Signup() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [name, setName] = useState("");

    const signup = async () => {
        try {
            await api.post("/auth/register", {
                email,
                password,
                name,
            });

            alert("Signup successful. Please login.");
            window.location.href = "/";
        } catch (e: any) {
            alert(e?.response?.data?.message || "Signup failed");
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
            <div className="bg-white p-6 rounded shadow w-80">
                <h2 className="text-xl font-bold mb-4">Sign Up</h2>

                <input
                    className="border p-2 w-full mb-3"
                    placeholder="Name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                />

                <input
                    className="border p-2 w-full mb-3"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                />

                <input
                    className="border p-2 w-full mb-3"
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                />

                <button
                    onClick={signup}
                    className="bg-green-600 text-white w-full py-2 rounded"
                >
                    Create Account
                </button>

                <p className="text-sm mt-3 text-center">
                    Already have an account?{" "}
                    <a href="/" className="text-blue-600 underline">
                        Login
                    </a>
                </p>
            </div>
        </div>
    );
}
