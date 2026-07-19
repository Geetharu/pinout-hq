"use client";

import React, { useState, useEffect } from 'react';
import { MessageSquare, Send, User, Clock, AlertCircle, CheckCircle2 } from 'lucide-react';

interface Comment {
  _id?: string;
  name: string;
  email: string;
  comment: string;
  createdAt?: string;
}

interface CommunityCommentsProps {
  componentId: string;
  componentName: string;
}

export default function CommunityComments({ componentId, componentName }: CommunityCommentsProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [commentText, setCommentText] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000';

  useEffect(() => {
    const fetchComments = async () => {
      try {
        const res = await fetch(`${baseUrl}/api/v1/components/${componentId}/comments`);
        if (res.ok) {
          const json = await res.json();
          setComments(json.data || []);
        }
      } catch (err) {
        console.error('Failed to load comments:', err);
      } finally {
        setLoading(false);
      }
    };

    if (componentId) {
      fetchComments();
    }
  }, [componentId, baseUrl]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!name || !email || !commentText) {
      setErrorMsg('Please fill in all fields before posting.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch(`${baseUrl}/api/v1/components/${componentId}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, comment: commentText }),
      });

      const json = await res.json();

      if (!res.ok) {
        throw new Error(json.message || 'Failed to post comment.');
      }

      setComments((prev) => [json.data, ...prev]);
      setSuccessMsg('Your engineering note has been published!');
      setName('');
      setEmail('');
      setCommentText('');
    } catch (err: any) {
      setErrorMsg(err.message || 'An error occurred while posting your comment.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="p-6 md:p-8 rounded-2xl bg-slate-900/50 border border-slate-800 space-y-8 mt-12 font-mono">
      <div>
        <div className="flex items-center gap-2 text-cyan-400 text-xs font-bold uppercase tracking-widest mb-1">
          <MessageSquare className="w-4 h-4" />
          <span>Community Telemetry</span>
        </div>
        <h3 className="text-xl md:text-2xl font-bold font-mono text-slate-100">
          Join the {componentName} Discussion
        </h3>
        <p className="text-xs font-mono text-slate-400 mt-1">
          Have you integrated the {componentName} in your custom PCB or IoT project? Share your feedback, voltage limits, and wiring tips below!
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4 bg-slate-950 p-6 rounded-xl border border-slate-800/80 shadow-inner">
        {errorMsg && (
          <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-lg flex items-center gap-2 text-xs text-rose-400">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}
        {successMsg && (
          <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-lg flex items-center gap-2 text-xs text-emerald-400">
            <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-mono text-slate-400 mb-1">Name *</label>
            <input 
              type="text" 
              placeholder="Engineer Name" 
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-cyan-500 font-mono transition" 
            />
          </div>
          <div>
            <label className="block text-xs font-mono text-slate-400 mb-1">Email * (Hidden from public)</label>
            <input 
              type="email" 
              placeholder="developer@company.com" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-cyan-500 font-mono transition" 
            />
          </div>
        </div>
        <div>
          <label className="block text-xs font-mono text-slate-400 mb-1">Engineering Comment *</label>
          <textarea 
            rows={4} 
            placeholder="Share your hardware troubleshooting steps, decoupling capacitor values, or project schematics..." 
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            className="w-full bg-slate-900 border border-slate-800 rounded-lg p-3 text-sm text-slate-200 focus:outline-none focus:border-cyan-500 font-mono transition"
          ></textarea>
        </div>
        <button 
          type="submit" 
          disabled={submitting}
          className="py-2.5 px-6 bg-cyan-500 hover:bg-cyan-400 disabled:bg-slate-700 disabled:text-slate-500 text-slate-950 font-mono font-bold text-xs rounded-lg transition shadow-[0_0_15px_rgba(0,229,255,0.2)] flex items-center gap-2"
        >
          <Send className="w-3.5 h-3.5" />
          <span>{submitting ? 'Transmitting...' : 'Post Engineering Comment'}</span>
        </button>
      </form>

      <div className="space-y-4 pt-4 border-t border-slate-800">
        <h4 className="text-sm font-bold text-slate-300 uppercase tracking-wider">
          Verified Developer Notes ({comments.length})
        </h4>

        {loading ? (
          <div className="text-xs text-slate-500 py-4 text-center animate-pulse">Loading engineering telemetry...</div>
        ) : comments.length === 0 ? (
          <div className="p-8 text-center rounded-xl bg-slate-950/40 border border-slate-800/60 text-xs text-slate-500">
            No community notes registered for this module yet. Be the first engineer to publish test data above!
          </div>
        ) : (
          <div className="space-y-4">
            {comments.map((item, idx) => (
              <div key={item._id || idx} className="p-4 rounded-xl bg-slate-950 border border-slate-800/80 space-y-2">
                <div className="flex items-center justify-between border-b border-slate-800/60 pb-2">
                  <div className="flex items-center gap-2 text-xs font-bold text-cyan-400">
                    <User className="w-3.5 h-3.5" />
                    <span>{item.name}</span>
                  </div>
                  <div className="flex items-center gap-1 text-[10px] text-slate-500 font-mono">
                    <Clock className="w-3 h-3" />
                    <span>{item.createdAt ? new Date(item.createdAt).toLocaleDateString() : 'Just now'}</span>
                  </div>
                </div>
                <p className="text-xs md:text-sm text-slate-300 font-sans leading-relaxed whitespace-pre-wrap">
                  {item.comment}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}