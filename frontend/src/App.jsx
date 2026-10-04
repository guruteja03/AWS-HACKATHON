import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import ShowcasePage from './pages/ShowcasePage';
import { Layout } from './components/Layout';
import { AuthProvider, useAuth } from './context/AuthContext';
import {
  AccountsPage,
  ArchitecturePage,
  CloudTrailPage,
  CloudWatchPage,
  DashboardPage,
  DocumentationPage,
  EC2Page,
  IpAddressingPage,
  LoginPage,
  NetworkAclsPage,
  NetworkPage,
  NotFoundPage,
  RamPage,
  SecurityGroupsPage,
} from './pages/Pages';
import {
  CidrCalculatorPage,
  CliLibraryPage,
  PresentationPage,
  QuizPage,
  RamExplainerPage,
  SecurityPosturePage,
  SetupChecklistPage,
} from './pages/FeaturePages';

function ProtectedRoute({ children }) {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/showcase" element={<ProtectedRoute><Layout><ShowcasePage /></Layout></ProtectedRoute>} />
      <Route path="/dashboard" element={<ProtectedRoute><Layout><DashboardPage /></Layout></ProtectedRoute>} />
      <Route path="/accounts" element={<ProtectedRoute><Layout><AccountsPage /></Layout></ProtectedRoute>} />
      <Route path="/network" element={<ProtectedRoute><Layout><NetworkPage /></Layout></ProtectedRoute>} />
      <Route path="/ram" element={<ProtectedRoute><Layout><RamPage /></Layout></ProtectedRoute>} />
      <Route path="/ec2" element={<ProtectedRoute><Layout><EC2Page /></Layout></ProtectedRoute>} />
      <Route path="/security-groups" element={<ProtectedRoute><Layout><SecurityGroupsPage /></Layout></ProtectedRoute>} />
      <Route path="/network-acls" element={<ProtectedRoute><Layout><NetworkAclsPage /></Layout></ProtectedRoute>} />
      <Route path="/ip-addressing" element={<ProtectedRoute><Layout><IpAddressingPage /></Layout></ProtectedRoute>} />
      <Route path="/cloudtrail" element={<ProtectedRoute><Layout><CloudTrailPage /></Layout></ProtectedRoute>} />
      <Route path="/cloudwatch" element={<ProtectedRoute><Layout><CloudWatchPage /></Layout></ProtectedRoute>} />
      <Route path="/architecture" element={<ProtectedRoute><Layout><ArchitecturePage /></Layout></ProtectedRoute>} />
      <Route path="/documentation" element={<ProtectedRoute><Layout><DocumentationPage /></Layout></ProtectedRoute>} />
      <Route path="/ram-explainer" element={<ProtectedRoute><Layout><RamExplainerPage /></Layout></ProtectedRoute>} />
      <Route path="/setup" element={<ProtectedRoute><Layout><SetupChecklistPage /></Layout></ProtectedRoute>} />
      <Route path="/cli-commands" element={<ProtectedRoute><Layout><CliLibraryPage /></Layout></ProtectedRoute>} />
      <Route path="/security-posture" element={<ProtectedRoute><Layout><SecurityPosturePage /></Layout></ProtectedRoute>} />
      <Route path="/cidr-calculator" element={<ProtectedRoute><Layout><CidrCalculatorPage /></Layout></ProtectedRoute>} />
      <Route path="/quiz" element={<ProtectedRoute><Layout><QuizPage /></Layout></ProtectedRoute>} />
      <Route path="/presentation" element={<ProtectedRoute><PresentationPage /></ProtectedRoute>} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
}
