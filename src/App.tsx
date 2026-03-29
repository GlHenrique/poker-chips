import { ThemeProvider } from "@/components/app"
import { Layout } from "@/components/layout"
import { TooltipProvider } from "@/components/ui/tooltip"
import { TimerProvider } from "@/context/TimerContext"

function App() {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <TooltipProvider delayDuration={300}>
        <TimerProvider>
          <Layout />
        </TimerProvider>
      </TooltipProvider>
    </ThemeProvider>
  )
}

export default App