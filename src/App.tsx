import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { WalletProvider } from './context/WalletContext';
import Header from './components/Header';
import Footer from './components/Footer';
import Landing from './pages/Landing';
import CreateIntent from './pages/CreateIntent';
import ReviewSign from './pages/ReviewSign';
import IntentStatus from './pages/IntentStatus';
import History from './pages/History';

function App() {
    return (
        <WalletProvider>
            <Router>
                <div className="min-h-screen bg-pb-bg-primary flex flex-col">
                    <Header />
                    <main className="flex-1">
                        <Routes>
                            <Route path="/" element={<Landing />} />
                            <Route path="/create" element={<CreateIntent />} />
                            <Route path="/review" element={<ReviewSign />} />
                            <Route path="/status/:id" element={<IntentStatus />} />
                            <Route path="/history" element={<History />} />
                        </Routes>
                    </main>
                    <Footer />
                </div>
            </Router>
        </WalletProvider>
    );
}

export default App;
