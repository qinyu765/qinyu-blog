import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './components/Layout';
import { Home } from './pages/Home';
import { BlogList } from './pages/BlogList';
import { BlogPost } from './pages/BlogPost';
import { TopicList } from './pages/TopicList';
import { TopicDetail } from './pages/TopicDetail';
import { TopicPostPage } from './pages/TopicPostPage';
import { ScrollToTop } from './components/ScrollToTop';

function App() {
  return (
    <HashRouter>
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="blog" element={<BlogList />} />
          <Route path="blog/:id" element={<BlogPost />} />
          <Route path="topics" element={<TopicList />} />
          <Route path="topics/:topicSlug" element={<TopicDetail />} />
          <Route path="topics/:topicSlug/:postSlug" element={<TopicPostPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </HashRouter>
  );
}

export default App;
