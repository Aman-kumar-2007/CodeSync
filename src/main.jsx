import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import { BrowserRouter } from "react-router"
import "./index.css"
import App from "./App.jsx"

// Apply the saved theme before React renders the application.
const savedTheme = localStorage.getItem("codesync-theme") || "light"

const actualTheme =
    savedTheme === "system"
        ? window.matchMedia("(prefers-color-scheme: dark)").matches
            ? "dark"
            : "light"
        : savedTheme

document.documentElement.dataset.theme = actualTheme

createRoot(document.getElementById("root")).render(
    <StrictMode>
        <BrowserRouter>
            <App />
        </BrowserRouter>
    </StrictMode>,
)