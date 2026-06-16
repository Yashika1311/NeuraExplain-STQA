import { useState, useContext } from "react";
import API from "../api";
import { AuthContext } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { useNavigate, Link } from "react-router-dom";
import { Eye, EyeOff, Mail, Lock, Zap } from "lucide-react";
import "./Login.css";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();
  useTheme();

  const handleSubmit = async (e) => {
    e?.preventDefault?.();
    setError("");

    try {
      setIsSubmitting(true);
      const res = await API.post("/auth/login", { email, password });
      login(res.data);
      navigate("/chat");
    } catch (err) {
      const msg =
        err?.response?.data?.message || err.message || "Login failed";
      setError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="loginPage">
      <div className="loginShell">
        <div className="loginForm">
          <div className="loginHeader">
            <div className="flex items-center justify-center mb-4">
              <Zap className="w-8 h-8 text-cyan-400 mr-2" />
              <span className="text-2xl font-bold text-white">Neura</span>
            </div>
            <h1>Sign in</h1>
            <p>Welcome back to Neura. Please enter your details.</p>
          </div>

          {error ? <div className="loginError">{error}</div> : null}

          <form onSubmit={handleSubmit} className="loginFields">
            <div className="loginGroup">
              <label htmlFor="email">Email Address</label>
              <div className="loginInputWrap">
                <Mail size={20} className="loginIcon" />
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="loginInput"
                />
              </div>
            </div>

            <div className="loginGroup">
              <label htmlFor="password">Password</label>
              <div className="loginInputWrap">
                <Lock size={20} className="loginIcon" />
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="loginInput loginPasswordInput"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="loginTogglePw"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <button type="submit" className="loginButton" disabled={isSubmitting}>
              {isSubmitting ? "Logging in..." : "Login"}
            </button>
          </form>

          <div className="loginDivider">
            <div className="loginDividerLine" />
            <span>or</span>
            <div className="loginDividerLine" />
          </div>

          <Link to="/register" className="loginSecondaryLink">
            Create a new account
          </Link>

          <p className="loginFooter">
            New here? <Link to="/register" className="loginInlineLink">Sign up</Link>
          </p>
        </div>

        <div className="loginIllustration">
          <h2>Neura</h2>
          <p>
            Your intelligent AI learning companion — Securely access your personalized learning experience.
          </p>
          <div className="loginFeatures">
            <div className="loginFeature">
              <span className="loginFeatureDot" />
              <span>Smart AI assistance</span>
            </div>
            <div className="loginFeature">
              <span className="loginFeatureDot" />
              <span>24/7 Learning support</span>
            </div>
            <div className="loginFeature">
              <span className="loginFeatureDot" />
              <span>Personalized guidance</span>
            </div>
          </div>

          <div className="loginRobo" aria-hidden>
            <div className="w-32 h-32 mx-auto mb-4 rounded-full overflow-hidden bg-linear-to-br from-cyan-400 to-blue-500 flex items-center justify-center">
              <img
                src="/src/assets/Neura.png"
                alt="Neura Robot"
                className="w-full h-full object-contain"
              />
            </div>
            <div className="loginRoboCaption">Hello! I'm Neura, your learning companion!</div>
          </div>
        </div>
      </div>
    </div>
  );
}
