import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import { RouterProvider } from "react-router-dom"
import { AppProvider } from "@/context/AppContext"
import { NotificationToast } from "@/components/NotificationToast"
import { router } from "@/router"
import "./index.css"

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <AppProvider>
      <RouterProvider router={router} />
      <NotificationToast />
    </AppProvider>
  </StrictMode>,
)
