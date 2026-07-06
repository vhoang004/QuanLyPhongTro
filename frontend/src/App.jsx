import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/common/ProtectedRoute';
import AppLayout from './components/layout/AppLayout';
import Login from './pages/auth/Login';

import Rooms from './pages/rooms/Rooms';
import RoomHistory from './pages/rooms/RoomHistory';
import Tenants from './pages/tenants/Tenants';
import Contracts from './pages/contracts/Contracts';
import MeterReadings from './pages/meterReadings/MeterReadings';
import Invoices from './pages/invoices/Invoices';
import Payments from './pages/payments/Payments';
import Debts from './pages/debts/Debts';
import OwnerConfig from './pages/ownerConfig/OwnerConfig';
import Accounts from './pages/accounts/Accounts';
import Services from './pages/services/Services';

import Dashboard from './pages/dashboard/Dashboard';
import './styles/index.css';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <AppLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route
              path="dashboard"
              element={
                <ProtectedRoute roles={['manager']}>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="rooms"
              element={
                <ProtectedRoute roles={['manager']}>
                  <Rooms />
                </ProtectedRoute>
              }
            />
            <Route
              path="rooms/:roomId/history"
              element={
                <ProtectedRoute roles={['manager']}>
                  <RoomHistory />
                </ProtectedRoute>
              }
            />
            <Route
              path="tenants"
              element={
                <ProtectedRoute roles={['manager']}>
                  <Tenants />
                </ProtectedRoute>
              }
            />
            <Route
              path="contracts"
              element={
                <ProtectedRoute roles={['manager']}>
                  <Contracts />
                </ProtectedRoute>
              }
            />
            <Route
              path="meter-readings"
              element={
                <ProtectedRoute roles={['manager']}>
                  <MeterReadings />
                </ProtectedRoute>
              }
            />
            <Route
              path="invoices"
              element={
                <ProtectedRoute roles={['manager']}>
                  <Invoices />
                </ProtectedRoute>
              }
            />
            <Route
              path="payments"
              element={
                <ProtectedRoute roles={['manager']}>
                  <Payments />
                </ProtectedRoute>
              }
            />
            <Route
              path="debts"
              element={
                <ProtectedRoute roles={['manager']}>
                  <Debts />
                </ProtectedRoute>
              }
            />
            <Route
              path="services"
              element={
                <ProtectedRoute roles={['manager']}>
                  <Services />
                </ProtectedRoute>
              }
            />
            <Route
              path="owner-config"
              element={
                <ProtectedRoute roles={['manager']}>
                  <OwnerConfig />
                </ProtectedRoute>
              }
            />
            <Route
              path="accounts"
              element={
                <ProtectedRoute roles={['admin']}>
                  <Accounts />
                </ProtectedRoute>
              }
            />
          </Route>
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
