import { ThemeProvider } from "@/components/app"
import { Layout } from "@/components/layout"

function App() {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <Layout />
    </ThemeProvider>
  )
}

export default App