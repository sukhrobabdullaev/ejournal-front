import React, { Suspense as ReactSuspense } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router';
import { AuthProvider } from './contexts/AuthContext';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { Toaster } from './components/ui/sonner';

function lazyNamed<T extends React.ComponentType<any>>(
  importer: () => Promise<any>,
  exportName: string
) {
  return React.lazy(async () => {
    const module = await importer();
    return { default: module[exportName] } as { default: T };
  });
}

const Home = lazyNamed(() => import('./pages/Home'), 'Home');
const Articles = lazyNamed(() => import('./pages/Articles'), 'Articles');
const ArticleDetail = lazyNamed(() => import('./pages/ArticleDetail'), 'ArticleDetail');
const PublishedIssues = lazyNamed(() => import('./pages/PublishedIssues'), 'PublishedIssues');
const PublishedIssueDetail = lazyNamed(
  () => import('./pages/PublishedIssueDetail'),
  'PublishedIssueDetail'
);
const SubmitPaper = lazyNamed(() => import('./pages/SubmitPaper'), 'SubmitPaper');
const AuthorGuidelines = lazyNamed(
  () => import('./pages/AuthorGuidelines'),
  'AuthorGuidelines'
);
const AimsScope = lazyNamed(() => import('./pages/AimsScope'), 'AimsScope');
const EditorialBoard = lazyNamed(
  () => import('./pages/EditorialBoard'),
  'EditorialBoard'
);
const Policies = lazyNamed(() => import('./pages/Policies'), 'Policies');
const About = lazyNamed(() => import('./pages/About'), 'About');
const Contact = lazyNamed(() => import('./pages/Contact'), 'Contact');
const Login = lazyNamed(() => import('./pages/Login'), 'Login');
const Register = lazyNamed(() => import('./pages/Register'), 'Register');
const VerifyEmail = lazyNamed(() => import('./pages/VerifyEmail'), 'VerifyEmail');
const DashboardNew = lazyNamed(() => import('./pages/DashboardNew'), 'DashboardNew');
const SubmissionDetail = lazyNamed(
  () => import('./pages/SubmissionDetail'),
  'SubmissionDetail'
);
const EditorDashboard = lazyNamed(
  () => import('./pages/EditorDashboard'),
  'EditorDashboard'
);
const EditorSubmissionDetail = lazyNamed(
  () => import('./pages/EditorSubmissionDetail'),
  'EditorSubmissionDetail'
);
const ReviewInvite = lazyNamed(() => import('./pages/ReviewInvite'), 'ReviewInvite');
const ReviewInviteNew = lazyNamed(
  () => import('./pages/ReviewInviteNew'),
  'ReviewInviteNew'
);
const ReviewAssignmentDetail = lazyNamed(
  () => import('./pages/ReviewAssignmentDetail'),
  'ReviewAssignmentDetail'
);
const CertificatePublic = lazyNamed(
  () => import('./pages/CertificatePublic'),
  'CertificatePublic'
);
const JournalCertificatePublic = lazyNamed(
  () => import('./pages/JournalCertificatePublic'),
  'JournalCertificatePublic'
);

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="flex min-h-screen flex-col bg-[#EEF5FF]">
          <Header />
          <main className="grow pt-2 pb-8 md:pt-3 md:pb-10">
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
                <Route path="/published" element={<PublishedIssues />} />
                <Route path="/published/:issueId" element={<PublishedIssueDetail />} />
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
                <Route path="/submissions/:id" element={<SubmissionDetail />} />
                <Route path="/editor" element={<EditorDashboard />} />
                <Route path="/editor/submissions/:id" element={<EditorSubmissionDetail />} />
                <Route path="/review-invite" element={<ReviewInvite />} />
                <Route path="/review/invite/:token" element={<ReviewInviteNew />} />
                <Route path="/review/assignments/:id" element={<ReviewAssignmentDetail />} />
                <Route path="/certificate/:code" element={<CertificatePublic />} />
                <Route path="/journal-certificate/:code" element={<JournalCertificatePublic />} />
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
