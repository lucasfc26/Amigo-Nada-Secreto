import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { AuthProvider } from "./auth/AuthProvider.tsx";
import { Frame } from "./components/Frame.tsx";
import { AuthPage } from "./pages/AuthPage.tsx";
import { HomePage } from "./pages/HomePage.tsx";
import { RoomPage } from "./pages/RoomPage.tsx";

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Frame>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/entrar" element={<AuthPage mode="login" />} />
            <Route path="/cadastrar" element={<AuthPage mode="signup" />} />
            <Route path="/sala/:roomId" element={<RoomPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Frame>
      </BrowserRouter>
    </AuthProvider>
  );
}
