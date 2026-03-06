import React, { Suspense as ReactSuspense } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router';
import { AuthProvider } from './contexts/AuthContext';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { Toaster } from './components/ui/sonner';

const Home = React.lazy(() => import('./pages/Home').then((m) => ({ default: m.Home })));
const Articles = React.lazy(() =>
  import('./pages/Articles').then((m) => ({ default: m.Articles }))
);
const ArticleDetail = React.lazy(() =>
  import('./pages/ArticleDetail').then((m) => ({ default: m.ArticleDetail }))
);
const SubmitPaper = React.lazy(() =>
  import('./pages/SubmitPaper').then((m) => ({ default: m.SubmitPaper }))
);
const AuthorGuidelines = React.lazy(() =>
  import('./pages/AuthorGuidelines').then((m) => ({ default: m.AuthorGuidelines }))
);
const AimsScope = React.lazy(() =>
  import('./pages/AimsScope').then((m) => ({ default: m.AimsScope }))
);
const EditorialBoard = React.lazy(() =>
  import('./pages/EditorialBoard').then((m) => ({ default: m.EditorialBoard }))
);
const Policies = React.lazy(() =>
  import('./pages/Policies').then((m) => ({ default: m.Policies }))
);
const About = React.lazy(() => import('./pages/About').then((m) => ({ default: m.About })));
const Contact = React.lazy(() => import('./pages/Contact').then((m) => ({ default: m.Contact })));
const Login = React.lazy(() => import('./pages/Login').then((m) => ({ default: m.Login })));
const Register = React.lazy(() =>
  import('./pages/Register').then((m) => ({ default: m.Register }))
);
const VerifyEmail = React.lazy(() =>
  import('./pages/VerifyEmail').then((m) => ({ default: m.VerifyEmail }))
);
const DashboardNew = React.lazy(() =>
  import('./pages/DashboardNew').then((m) => ({ default: m.DashboardNew }))
);
const SubmissionDetail = React.lazy(() =>
  import('./pages/SubmissionDetail').then((m) => ({ default: m.SubmissionDetail }))
);
const EditorDashboard = React.lazy(() =>
  import('./pages/EditorDashboard').then((m) => ({ default: m.EditorDashboard }))
);
const EditorSubmissionDetail = React.lazy(() =>
  import('./pages/EditorSubmissionDetail').then((m) => ({
    default: m.EditorSubmissionDetail,
  }))
);
const ReviewInvite = React.lazy(() =>
  import('./pages/ReviewInvite').then((m) => ({ default: m.ReviewInvite }))
);
const ReviewInviteNew = React.lazy(() =>
  import('./pages/ReviewInviteNew').then((m) => ({ default: m.ReviewInviteNew }))
);
const ReviewDashboard = React.lazy(() =>
  import('./pages/ReviewDashboard').then((m) => ({ default: m.ReviewDashboard }))
);
const ReviewAssignmentDetail = React.lazy(() =>
  import('./pages/ReviewAssignmentDetail').then((m) => ({
    default: m.ReviewAssignmentDetail,
  }))
);

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="flex min-h-screen flex-col bg-white">
          <Header />
          <main className="grow">
            <ReactSuspense
              fallback={
                <div className="flex min-h-[50vh] items-center justify-center">
                  <div className="text-center">
                    <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
                    <p className="text-sm text-gray-600">Loading page...</p>
                  </div>
                </div>
              }
            >
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/articles" element={<Articles />} />
                <Route path="/articles/:articleSlug" element={<ArticleDetail />} />
                <Route path="/submit" element={<SubmitPaper />} />
                <Route path="/submit/:submissionId" element={<SubmitPaper />} />
                <Route path="/guidelines" element={<AuthorGuidelines />} />
                <Route path="/aims-scope" element={<AimsScope />} />
                <Route path="/editorial-board" element={<EditorialBoard />} />
                <Route path="/policies" element={<Policies />} />
                <Route path="/about" element={<About />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/verify-email" element={<VerifyEmail />} />
                <Route path="/dashboard" element={<DashboardNew />} />
                <Route path="/submission/:id" element={<SubmissionDetail />} />
                <Route path="/editor" element={<EditorDashboard />} />
                <Route path="/editor/submissions/:id" element={<EditorSubmissionDetail />} />
                <Route path="/review-invite" element={<ReviewInvite />} />
                <Route path="/review/invite/:token" element={<ReviewInviteNew />} />
                <Route path="/review/dashboard" element={<ReviewDashboard />} />
                <Route path="/review/assignments/:id" element={<ReviewAssignmentDetail />} />
              </Routes>
            </ReactSuspense>
          </main>
          <Footer />
        </div>
        <Toaster />
      </Router>
    </AuthProvider>
  );
}
