import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "./context/ThemeContext";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Chat from "./pages/Chat";
import Community from "./pages/Community";
import Credits from "./pages/credits";
import PrivateRoute from "./components/PrivateRoute";

function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          <Route 
            path="/*" 
            element={
              <PrivateRoute>
                <div className="min-h-screen">
                  <Routes>
                    <Route path="/chat" element={<Chat />} />
                    <Route path="/community" element={<Community />} />
                    <Route path="/credits" element={<Credits />} />
                  </Routes>
                </div>
              </PrivateRoute>
            }
          />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
