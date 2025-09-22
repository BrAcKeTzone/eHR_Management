import React from "react";
import { useParams } from "react-router-dom";
import MainLayout from "../layouts/MainLayout";
import PostDetail from "../features/posts/PostDetail";
import CommentList from "../features/comments/CommentList";
import CommentForm from "../features/comments/CommentForm";

const PostDetailPage = () => {
  const { postId } = useParams();

  return (
    <MainLayout>
      <div className="container mx-auto p-4">
        <PostDetail postId={postId} />
        <CommentList postId={postId} />
        <CommentForm postId={postId} />
      </div>
    </MainLayout>
  );
};

export default PostDetailPage;
