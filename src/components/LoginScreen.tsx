import React, { useState } from 'react';
import { LogIn } from 'lucide-react';
import './LoginScreen.css';

export type UserRole = 'admin' | 'operator';

export interface UserSession {
  name: string;
  role: UserRole;
  loginTime: string;
}

interface LoginScreenProps {
  onLogin: (session: UserSession) => void;
}

export default function LoginScreen({ onLogin }: LoginScreenProps) {
  const [name, setName] = useState('');
  const [role, setRole] = useState<UserRole>('operator');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    onLogin({
      name: name.trim(),
      role,
      loginTime: new Date().toLocaleString(),
    });
  };

  return (
    <div className="login-page">
      <div className="login-card glass-panel">
        <div className="login-header">
          <h1 className="heading-tight">OptiQ Vision</h1>
          <p className="text-subtle">AI-Powered Quality Control</p>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          <div className="field">
            <label htmlFor="name">Operator Name</label>
            <input
              id="name"
              type="text"
              placeholder="Enter your name"
              value={name}
              onChange={e => setName(e.target.value)}
              autoFocus
            />
          </div>

          <div className="field">
            <label>Role</label>
            <div className="role-group">
              <button
                type="button"
                className={`role-btn ${role === 'operator' ? 'active' : ''}`}
                onClick={() => setRole('operator')}
              >
                <span className="role-title">Operator</span>
                <span className="role-desc">Scan & grade incoming lots</span>
              </button>
              <button
                type="button"
                className={`role-btn ${role === 'admin' ? 'active' : ''}`}
                onClick={() => setRole('admin')}
              >
                <span className="role-title">Admin</span>
                <span className="role-desc">View reports & supplier analytics</span>
              </button>
            </div>
          </div>

          <button type="submit" className="btn-login" disabled={!name.trim()}>
            <LogIn size={16} /> Sign In
          </button>
        </form>
      </div>
    </div>
  );
}
