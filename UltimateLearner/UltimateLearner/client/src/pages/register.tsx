import { useState } from "react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { toast } = useToast();

  const handleLogin = async (e) => {
    e.preventDefault();
    const res = await apiRequest("POST", "/api/auth/login", { email, password });
    if (res.ok) {
      const data = await res.json();
      localStorage.setItem("token", data.token);
      toast({ title: "Logged in!" });
      // redirect to home/dashboard
    } else {
      const err = await res.json();
      toast({ title: "Login failed", description: err.message, variant: "destructive" });
    }
  };

  return (
    <form onSubmit={handleLogin}>
      <input value={email} onChange={e => setEmail(e.target.value)} placeholder="Email" />
      <input value={password} onChange={e => setPassword(e.target.value)} type="password" placeholder="Password" />
      <button type="submit">Login</button>
    </form>
  );
}