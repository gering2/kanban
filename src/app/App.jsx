import { AppProviders } from './providers'
import { BoardPage } from '../features/board/BoardPage'

export default function App() {
  return (
    <AppProviders>
      <BoardPage />
    </AppProviders>
  )
}
