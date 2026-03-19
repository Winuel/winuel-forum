import { defineStore } from 'pinia'
import { ref } from 'vue'

export interface Post {
  id: string
  title: string
  content: string
  authorId: string
  authorUsername: string
  authorAvatar?: string
  categoryId: string
  categoryName: string
  tags: string[]
  createdAt: string
  updatedAt: string
  viewCount: number
  likeCount: number
  commentCount: number
}

export interface Comment {
  id: string
  postId: string
  authorId: string
  authorUsername: string
  authorAvatar?: string
  content: string
  parentId?: string
  parentAuthorUsername?: string
  createdAt: string
  updatedAt: string
  likeCount: number
  replies?: Comment[]
}

export const usePostStore = defineStore('post', () => {
  const posts = ref<Post[]>([])
  const currentPost = ref<Post | null>(null)
  const comments = ref<Comment[]>([])
  const loading = ref(false)

  function setPosts(newPosts: Post[]) {
    posts.value = newPosts
  }

  function setCurrentPost(post: Post | null) {
    currentPost.value = post
  }

  function setComments(newComments: Comment[]) {
    comments.value = newComments
  }

  function addPost(post: Post) {
    posts.value.unshift(post)
  }

  function updatePost(postId: string, updates: Partial<Post>) {
    const index = posts.value.findIndex(p => p.id === postId)
    if (index !== -1) {
      posts.value[index] = { ...posts.value[index], ...updates }
    }
    if (currentPost.value?.id === postId) {
      currentPost.value = { ...currentPost.value, ...updates }
    }
  }

  function deletePost(postId: string) {
    posts.value = posts.value.filter(p => p.id !== postId)
    if (currentPost.value?.id === postId) {
      currentPost.value = null
    }
  }

  function addComment(comment: Comment) {
    comments.value.push(comment)
  }

  function updateComment(commentId: string, updates: Partial<Comment>) {
    const index = comments.value.findIndex(c => c.id === commentId)
    if (index !== -1) {
      comments.value[index] = { ...comments.value[index], ...updates }
    }
  }

  function deleteComment(commentId: string) {
    comments.value = comments.value.filter(c => c.id !== commentId)
  }

  return {
    posts,
    currentPost,
    comments,
    loading,
    setPosts,
    setCurrentPost,
    setComments,
    addPost,
    updatePost,
    deletePost,
    addComment,
    updateComment,
    deleteComment,
  }
})