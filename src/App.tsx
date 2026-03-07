import { ThemeProvider } from "@/components/app"
import { Layout } from "@/components/layout"
import { TooltipProvider } from "@/components/ui/tooltip"

function App() {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <TooltipProvider delayDuration={300}>
        <Layout />
      </TooltipProvider>
    </ThemeProvider>
  )
}

export default App