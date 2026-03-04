import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Suspense, lazy } from 'react'
import { Toaster } from 'react-hot-toast'
import { AuthProvider } from './contexts/AuthContext'
import { DataProvider } from './contexts/DataContext'
import { ThemeProvider } from './contexts/ThemeContext'
import Layout from './components/Layout'
import Login from './pages/Login'
import ProtectedRoute from './components/ProtectedRoute'
import Loading from './components/Loading'

// Lazy load page components for code splitting
const Dashboard = lazy(() => import('./pages/Dashboard'))
const CreatePO = lazy(() => import('./pages/CreatePO'))
const CreateQuality = lazy(() => import('./pages/CreateQuality'))
const Mills = lazy(() => import('./pages/Mills'))
const Products = lazy(() => import('./pages/Products'))
const Customers = lazy(() => import('./pages/Customers'))
const OrderHistory = lazy(() => import('./pages/OrderHistory'))
const QualityRecords = lazy(() => import('./pages/QualityRecords'))
const Settings = lazy(() => import('./pages/Settings'))
const FlowButtonDemo = lazy(() => import('./pages/FlowButtonDemo'))
const Manager = lazy(() => import('./pages/Manager'))

function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <Toaster position="top-center" reverseOrder={false} />
        <AuthProvider>
          <DataProvider>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route element={<ProtectedRoute><Layout /></ProtectedRoute>}>
                <Route path="/" element={
                  <Suspense fallback={<Loading />}>
                    <Dashboard />
                  </Suspense>
                } />
                <Route path="/create-po" element={
                  <Suspense fallback={<Loading />}>
                    <CreatePO />
                  </Suspense>
                } />
                <Route path="/create-quality" element={
                  <Suspense fallback={<Loading />}>
                    <CreateQuality />
                  </Suspense>
                } />
                <Route path="/mills" element={
                  <Suspense fallback={<Loading />}>
                    <Mills />
                  </Suspense>
                } />
                <Route path="/products" element={
                  <Suspense fallback={<Loading />}>
                    <Products />
                  </Suspense>
                } />
                <Route path="/customers" element={
                  <Suspense fallback={<Loading />}>
                    <Customers />
                  </Suspense>
                } />
                <Route path="/history" element={
                  <Suspense fallback={<Loading />}>
                    <OrderHistory />
                  </Suspense>
                } />
                <Route path="/quality-records" element={
                  <Suspense fallback={<Loading />}>
                    <QualityRecords />
                  </Suspense>
                } />
                <Route path="/settings" element={
                  <Suspense fallback={<Loading />}>
                    <Settings />
                  </Suspense>
                } />
                <Route path="/flow-button-demo" element={
                  <Suspense fallback={<Loading />}>
                    <FlowButtonDemo />
                  </Suspense>
                } />
                <Route path="/manager" element={
                  <Suspense fallback={<Loading />}>
                    <Manager />
                  </Suspense>
                } />
              </Route>
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </DataProvider>
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  )
}

export default App
