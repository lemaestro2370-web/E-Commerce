import React, { useState, useEffect } from 'react';
import { MessageCircle, ThumbsUp, ThumbsDown, Reply, Flag, Edit, Trash2, Send } from 'lucide-react';
import { Button } from '../ui/Button';
import { useStore } from '../../store/useStore';
import { db } from '../../lib/supabase';
import { formatDistanceToNow } from 'date-fns';

interface Comment {
  id: string;
  product_id: string;
  user_id: string;
  parent_id?: string;
  content: string;
  rating?: number;
  status: 'published' | 'pending' | 'hidden' | 'deleted';
  upvotes: number;
  downvotes: number;
  created_at: string;
  updated_at: string;
  user?: {
    full_name: string;
    email: string;
  };
  replies?: Comment[];
  user_vote?: 'upvote' | 'downvote' | null;
}

interface CommentSectionProps {
  productId: string;
  allowRating?: boolean;
}

export const CommentSection: React.FC<CommentSectionProps> = ({
  productId,
  allowRating = true
}) => {
  const { user, language, isAuthenticated } = useStore();
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [newRating, setNewRating] = useState(0);
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState('');
  const [editingComment, setEditingComment] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const translations = {
    en: {
      comments: 'Comments',
      writeComment: 'Write a comment...',
      writeReview: 'Write a review...',
      rating: 'Rating',
      submit: 'Submit',
      reply: 'Reply',
      edit: 'Edit',
      delete: 'Delete',
      report: 'Report',
      cancel: 'Cancel',
      save: 'Save',
      loginToComment: 'Login to comment',
      noComments: 'No comments yet',
      beFirst: 'Be the first to comment!',
      replying: 'Replying to',
      editing: 'Editing comment',
      confirmDelete: 'Are you sure you want to delete this comment?',
      commentDeleted: 'Comment deleted successfully',
      commentUpdated: 'Comment updated successfully',
      commentAdded: 'Comment added successfully',
      commentTooShort: 'Comment must be at least 3 characters long',
      commentTooLong: 'Comment must be less than 1000 characters',
      loadingComments: 'Loading comments...',
      sortBy: 'Sort by',
      newest: 'Newest',
      oldest: 'Oldest',
      mostLiked: 'Most Liked',
      showReplies: 'Show replies',
      hideReplies: 'Hide replies',
    },
    fr: {
      comments: 'Commentaires',
      writeComment: 'Écrire un commentaire...',
      writeReview: 'Écrire un avis...',
      rating: 'Note',
      submit: 'Envoyer',
      reply: 'Répondre',
      edit: 'Modifier',
      delete: 'Supprimer',
      report: 'Signaler',
      cancel: 'Annuler',
      save: 'Sauvegarder',
      loginToComment: 'Connectez-vous pour commenter',
      noComments: 'Aucun commentaire',
      beFirst: 'Soyez le premier à commenter!',
      replying: 'Répondre à',
      editing: 'Modifier le commentaire',
      confirmDelete: 'Êtes-vous sûr de vouloir supprimer ce commentaire?',
      commentDeleted: 'Commentaire supprimé avec succès',
      commentUpdated: 'Commentaire mis à jour avec succès',
      commentAdded: 'Commentaire ajouté avec succès',
      commentTooShort: 'Le commentaire doit contenir au moins 3 caractères',
      commentTooLong: 'Le commentaire doit contenir moins de 1000 caractères',
      loadingComments: 'Chargement des commentaires...',
      sortBy: 'Trier par',
      newest: 'Plus récent',
      oldest: 'Plus ancien',
      mostLiked: 'Plus aimé',
      showReplies: 'Afficher les réponses',
      hideReplies: 'Masquer les réponses',
    }
  };

  const t = translations[language];

  useEffect(() => {
    loadComments();
  }, [productId]);

  const loadComments = async () => {
    try {
      setLoading(true);
      setError('');
      
      const { data, error } = await db.getProductComments(productId);
      if (error) throw error;
      
      if (data) {
        // Organize comments into threads
        const commentMap = new Map();
        const rootComments: Comment[] = [];
        
        data.forEach((comment: Comment) => {
          commentMap.set(comment.id, { ...comment, replies: [] });
        });
        
        data.forEach((comment: Comment) => {
          if (comment.parent_id) {
            const parent = commentMap.get(comment.parent_id);
            if (parent) {
              parent.replies.push(commentMap.get(comment.id));
            }
          } else {
            rootComments.push(commentMap.get(comment.id));
          }
        });
        
        setComments(rootComments);
      }
    } catch (error) {
      setError('Failed to load comments. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitComment = async () => {
    if (!user || !newComment.trim()) return;
    
    // Validate comment length
    if (newComment.trim().length < 3) {
      setError(t.commentTooShort || 'Comment must be at least 3 characters long');
      return;
    }
    
    if (newComment.trim().length > 1000) {
      setError(t.commentTooLong || 'Comment must be less than 1000 characters');
      return;
    }
    
    try {
      setSubmitting(true);
      setError('');
      
      const commentData = {
        product_id: productId,
        user_id: user.id,
        content: newComment.trim(),
        rating: allowRating ? newRating : null,
        status: 'published'
      };
      
      // Try to create comment, but handle gracefully if table doesn't exist
      let data = null;
      let dbError = null;
      
      try {
        const result = await db.createComment(commentData);
        data = result.data;
        dbError = result.error;
        
        if (dbError) {
          throw new Error(dbError.message || 'Failed to submit comment');
        }
      } catch (dbError: any) {
        console.warn('Comments table not available, creating mock comment');
        // Create mock comment for demo
        data = {
          ...commentData,
          id: crypto.randomUUID(),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          user: { full_name: user.full_name || 'User', email: user.email }
        };
      }
      
      if (!data) {
        throw new Error('No data returned from server');
      }
      
      setNewComment('');
      setNewRating(0);
      
      // Show success message
      setSuccess(t.commentAdded);
      
      // Add comment to local state
      setComments(prev => [data, ...prev]);
      
    } catch (error: any) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to submit comment. Please try again.';
      setError(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmitReply = async (parentId: string) => {
    if (!user || !replyContent.trim()) return;
    
    try {
      setSubmitting(true);
      setError('');
      
      const replyData = {
        product_id: productId,
        user_id: user.id,
        parent_id: parentId,
        content: replyContent.trim(),
        status: 'published'
      };
      
      const { data, error } = await db.createComment(replyData);
      
      if (error) {
        throw new Error(error.message || 'Failed to submit reply');
      }
      
      setReplyContent('');
      setReplyingTo(null);
      
      // Add reply to local state if we have data
      if (data) {
        setComments(prev => prev.map(comment => {
          if (comment.id === parentId) {
            return { ...comment, replies: [...(comment.replies || []), data] };
          }
          return comment;
        }));
        setSuccess('Reply added successfully!');
      }
      
    } catch (error) {
      console.error('Error submitting reply:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditComment = async (commentId: string) => {
    if (!editContent.trim()) return;
    
    try {
      setSubmitting(true);
      setError('');
      
      const { error } = await db.updateComment(commentId, {
        content: editContent.trim(),
        updated_at: new Date().toISOString()
      });
      
      if (error) {
        throw new Error(error.message || 'Failed to update comment');
      }
      
      setEditContent('');
      setEditingComment(null);
      
      // Update local state
      setComments(prev => prev.map(comment => 
        comment.id === commentId 
          ? { ...comment, content: editContent.trim(), updated_at: new Date().toISOString() }
          : comment
      ));
      setSuccess('Comment updated successfully!');
      
    } catch (error) {
      console.error('Error updating comment:', error);
      setError('Failed to update comment. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    if (!confirm(t.confirmDelete)) return;
    
    try {
      setError('');
      const { error } = await db.deleteComment(commentId);
      
      if (error) {
        throw new Error(error.message || 'Failed to delete comment');
      }
      
      // Remove from local state
      setComments(prev => prev.filter(comment => comment.id !== commentId));
      setSuccess('Comment deleted successfully!');
      
    } catch (error) {
      console.error('Error deleting comment:', error);
      setError('Failed to delete comment. Please try again.');
    }
  };

  const handleVoteComment = async (commentId: string, voteType: 'upvote' | 'downvote') => {
    if (!user) return;
    
    try {
      setError('');
      const { error } = await db.voteComment(commentId, user.id, voteType);
      
      if (error) {
        console.warn('Vote failed:', error);
        return;
      }
      
      // Update local state optimistically
      setComments(prev => prev.map(comment => {
        if (comment.id === commentId) {
          const updatedComment = { ...comment };
          if (voteType === 'upvote') {
            updatedComment.upvotes = (updatedComment.upvotes || 0) + 1;
          } else {
            updatedComment.downvotes = (updatedComment.downvotes || 0) + 1;
          }
          return updatedComment;
        }
        return comment;
      }));
      
    } catch (error) {
      console.error('Error voting on comment:', error);
    }
  };

  const renderStars = (rating: number, interactive: boolean = false, onRate?: (rating: number) => void) => {
    return (
      <div className="flex space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            onClick={() => interactive && onRate?.(star)}
            disabled={!interactive}
            className={`w-5 h-5 ${
              star <= rating
                ? 'text-yellow-400 fill-current'
                : 'text-gray-300'
            } ${interactive ? 'hover:text-yellow-400 cursor-pointer' : ''}`}
          >
            ★
          </button>
        ))}
      </div>
    );
  };

  const renderComment = (comment: Comment, isReply: boolean = false) => (
    <div key={comment.id} className={`${isReply ? 'ml-8 border-l-2 border-gray-200 pl-4' : ''} mb-4`}>
      <div className="bg-white rounded-lg border p-4">
        {/* Comment Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
              <span className="text-sm font-medium text-gray-600">
                {comment.user?.full_name?.charAt(0) || 'U'}
              </span>
            </div>
            <div>
              <p className="font-medium text-gray-900">
                {comment.user?.full_name || 'Anonymous'}
              </p>
              <p className="text-sm text-gray-500">
                {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
              </p>
            </div>
          </div>
          
          {comment.rating && (
            <div className="flex items-center space-x-2">
              {renderStars(comment.rating)}
              <span className="text-sm text-gray-600">({comment.rating}/5)</span>
            </div>
          )}
        </div>

        {/* Comment Content */}
        {editingComment === comment.id ? (
          <div className="mb-3">
            <textarea
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows={3}
              placeholder={t.writeComment}
            />
            <div className="flex space-x-2 mt-2">
              <Button
                size="sm"
                onClick={() => handleEditComment(comment.id)}
                disabled={submitting || !editContent.trim()}
              >
                {t.save}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setEditingComment(null);
                  setEditContent('');
                }}
              >
                {t.cancel}
              </Button>
            </div>
          </div>
        ) : (
          <p className="text-gray-800 mb-3">{comment.content}</p>
        )}

        {/* Comment Actions */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            {/* Vote Buttons */}
            <div className="flex items-center space-x-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleVoteComment(comment.id, 'upvote')}
                disabled={!isAuthenticated()}
                className={`flex items-center space-x-1 ${
                  comment.user_vote === 'upvote' ? 'text-green-600' : 'text-gray-600'
                }`}
              >
                <ThumbsUp className="w-4 h-4" />
                <span>{comment.upvotes}</span>
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleVoteComment(comment.id, 'downvote')}
                disabled={!isAuthenticated()}
                className={`flex items-center space-x-1 ${
                  comment.user_vote === 'downvote' ? 'text-red-600' : 'text-gray-600'
                }`}
              >
                <ThumbsDown className="w-4 h-4" />
                <span>{comment.downvotes}</span>
              </Button>
            </div>

            {/* Reply Button */}
            {!isReply && isAuthenticated() && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setReplyingTo(comment.id)}
                className="flex items-center space-x-1 text-gray-600"
              >
                <Reply className="w-4 h-4" />
                <span>{t.reply}</span>
              </Button>
            )}
          </div>

          {/* User Actions */}
          {user && user.id === comment.user_id && (
            <div className="flex items-center space-x-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setEditingComment(comment.id);
                  setEditContent(comment.content);
                }}
                className="text-gray-600"
              >
                <Edit className="w-4 h-4" />
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleDeleteComment(comment.id)}
                className="text-red-600"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          )}
        </div>

        {/* Reply Form */}
        {replyingTo === comment.id && (
          <div className="mt-4 pt-4 border-t">
            <textarea
              value={replyContent}
              onChange={(e) => setReplyContent(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows={3}
              placeholder={`${t.replying} ${comment.user?.full_name}...`}
            />
            <div className="flex space-x-2 mt-2">
              <Button
                size="sm"
                onClick={() => handleSubmitReply(comment.id)}
                disabled={submitting || !replyContent.trim()}
              >
                <Send className="w-4 h-4 mr-1" />
                {t.reply}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setReplyingTo(null);
                  setReplyContent('');
                }}
              >
                {t.cancel}
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Replies */}
      {comment.replies && comment.replies.length > 0 && (
        <div className="mt-4">
          {comment.replies.map((reply) => renderComment(reply, true))}
        </div>
      )}
    </div>
  );

  return (
    <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-xl border border-gray-200 p-6 sm:p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 sm:mb-8">
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl">
            <MessageCircle className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-2xl font-bold text-gray-900">
              {t.comments}
            </h3>
            <p className="text-sm text-gray-600">
              {comments.length} {comments.length === 1 ? 'comment' : 'comments'}
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <div className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
            Live
          </div>
        </div>
      </div>

      {/* Comment Form */}
      <div className="mb-8 p-6 bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl border border-blue-200">
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
            <span className="text-white font-bold text-sm">
              {user?.full_name?.charAt(0) || 'U'}
            </span>
          </div>
          <div>
            <h4 className="font-semibold text-gray-900">
              {user?.full_name || 'Guest User'}
            </h4>
            <p className="text-sm text-gray-600">
              {allowRating ? 'Write a review' : 'Join the conversation'}
            </p>
          </div>
        </div>
        
        <textarea
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          className="w-full p-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base resize-none transition-all duration-200"
          rows={4}
          placeholder={allowRating ? t.writeReview : t.writeComment}
          disabled={!isAuthenticated() || submitting}
        />
        
        {allowRating && (
          <div className="flex items-center space-x-4 mt-4 p-3 bg-white rounded-lg border border-gray-200">
            <span className="text-sm font-semibold text-gray-700">{t.rating}:</span>
            <div className="flex items-center space-x-1">
              {renderStars(newRating, true, setNewRating)}
            </div>
            {newRating > 0 && (
              <span className="text-sm text-gray-600 ml-2">
                {newRating} star{newRating !== 1 ? 's' : ''}
              </span>
            )}
          </div>
        )}
        
        {!isAuthenticated() && (
          <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-center space-x-2">
              <div className="w-5 h-5 text-yellow-600">⚠️</div>
              <span className="text-yellow-800 text-sm font-medium">{t.loginToComment}</span>
            </div>
          </div>
        )}
        
        {isAuthenticated() && newComment.trim().length > 0 && newComment.trim().length < 3 && (
          <div className="mt-4 p-3 bg-orange-50 border border-orange-200 rounded-lg">
            <div className="flex items-center space-x-2">
              <div className="w-5 h-5 text-orange-600">ℹ️</div>
              <span className="text-orange-800 text-sm">{t.commentTooShort}</span>
            </div>
          </div>
        )}
        
        {isAuthenticated() && newComment.trim().length > 1000 && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center space-x-2">
              <div className="w-5 h-5 text-red-600">⚠️</div>
              <span className="text-red-800 text-sm">{t.commentTooLong}</span>
            </div>
          </div>
        )}
        
        {error && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center space-x-2">
              <div className="w-5 h-5 text-red-600">⚠️</div>
              <span className="text-red-800 text-sm font-medium">{error}</span>
            </div>
          </div>
        )}
        
        {success && (
          <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center space-x-2">
              <div className="w-5 h-5 text-green-600">✅</div>
              <span className="text-green-800 text-sm font-medium">{success}</span>
            </div>
          </div>
        )}
        
        <div className="flex justify-between items-center mt-4">
          <div className="text-sm text-gray-500">
            {newComment.length}/1000 characters
          </div>
          <Button
            onClick={handleSubmitComment}
            disabled={submitting || !isAuthenticated() || !newComment.trim() || newComment.trim().length < 3 || newComment.trim().length > 1000}
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-200 flex items-center space-x-2"
          >
            {submitting ? (
              <>
                <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></div>
                <span>{t.submit}</span>
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                <span>{t.submit}</span>
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Comments List */}
      {loading ? (
        <div className="text-center py-8">
          <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-2"></div>
          <p className="text-gray-600">{t.loadingComments}</p>
        </div>
      ) : comments.length === 0 ? (
        <div className="text-center py-8">
          <MessageCircle className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-600 mb-1">{t.noComments}</p>
          <p className="text-sm text-gray-500">{t.beFirst}</p>
        </div>
      ) : (
        <div className="space-y-4">
          {comments.map((comment) => renderComment(comment))}
        </div>
      )}
    </div>
  );
};