import React from "react";
import MainLayout from "../layouts/MainLayout";
import PostList from "../features/posts/PostList";

const HomePage = () => {
  return (
    <MainLayout>
      <div className="container mx-auto p-4">
        <h1 className="text-3xl font-bold mb-4">Latest Posts</h1>
        <PostList />
      </div>
    </MainLayout>
  );
};

export default HomePage;
