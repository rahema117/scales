import React from 'react';
import { BrowserRouter as Router, Routes, Route, Outlet } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';

// Public Pages
import Home from './pages/Home';
import NewRequest from './pages/NewRequest';
import TrackRequest from './pages/TrackRequest';
import ContactUs from './pages/ContactUs';
import DownloadForms from './pages/DownloadForms';
import TechnicalStandards from './pages/TechnicalStandards';
import Awareness from './pages/Awareness';
import PrivacyPolicy from './pages/PrivacyPolicy';
import AdminLogin from './pages/AdminLogin';

// Admin Pages
import AdminLayout from './pages/admin/AdminLayout';
import DashboardStats from './pages/admin/DashboardStats';
import RequestsManager from './pages/admin/RequestsManager';
import CompaniesManager from './pages/admin/CompaniesManager';
import OverdueManager from './pages/admin/OverdueManager';
import ReportsManager from './pages/admin/ReportsManager';
import MessagesManager from './pages/admin/MessagesManager';
import OfficeRecordsManager from './pages/admin/OfficeRecordsManager';

// Public Layout Wrapper
function PublicLayout() {
  return (
    <div dir="rtl" className="flex flex-col min-h-screen justify-between select-none text-right font-cairo">
      <Header />
      <main className="flex-grow">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <Routes>
        
        {/* Public Website Routes */}
        <Route path="/" element={<PublicLayout />}>
          <Route index element={<Home />} />
          <Route path="new-request" element={<NewRequest />} />
          <Route path="track" element={<TrackRequest />} />
          <Route path="download-forms" element={<DownloadForms />} />
          <Route path="technical-standards" element={<TechnicalStandards />} />
          <Route path="awareness" element={<Awareness />} />
          <Route path="privacy-policy" element={<PrivacyPolicy />} />
          <Route path="contact" element={<ContactUs />} />
        </Route>

        {/* Admin Login Route */}
        <Route path="/admin/login" element={<AdminLogin />} />

        {/* Admin Dashboard Protected Routes */}
        <Route path="/admin/dashboard" element={<AdminLayout />}>
          <Route index element={<DashboardStats />} />
          <Route path="requests" element={<RequestsManager />} />
          <Route path="companies" element={<CompaniesManager />} />
          <Route path="overdue" element={<OverdueManager />} />
          <Route path="reports" element={<ReportsManager />} />
          <Route path="messages" element={<MessagesManager />} />
          <Route path="office-records" element={<OfficeRecordsManager />} />
        </Route>

        {/* Catch All Redirect */}
        <Route path="*" element={<PublicLayout />}>
          <Route index element={<Home />} />
        </Route>

      </Routes>
    </Router>
  );
}
