import {StrictMode} from 'react'
import {createRoot} from 'react-dom/client'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
    <StrictMode>
        <App/>
    </StrictMode>,
)

if (import.meta.env.DEV) {
    createRoot(document.getElementById('dev')!).render(
        <div className="mt-4 p-2 border-2">
            <h1>Embeddable Components (Dev Mode only!)</h1>
            <ul>
                <li><a href="/src/pizzaz/">Pizzaz</a></li>
                <li><a href="/src/pizzaz-albums/">Pizzaz Album</a></li>
                <li><a href="/src/pizzaz-carousel/">Pizzaz Carousel</a></li>
                <li><a href="/src/pizzaz-list/">Pizzaz List</a></li>
            </ul>
        </div>
    )
}