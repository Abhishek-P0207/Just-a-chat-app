import { useState } from 'react';
import type { KeyboardEvent } from 'react';
import type { User } from '../types/chat';
import { signupUser, signinUser } from '../api';

interface UsernameModalProps {
    onRegistered: (user: User) => void;
}

type Mode = 'signin' | 'signup';

export function UsernameModal({ onRegistered }: UsernameModalProps) {
    const [mode, setMode] = useState<Mode>('signin');
    const [name, setName] = useState('');
    const [password, setPassword] = useState('');
    const [nameError, setNameError] = useState('');
    const [passError, setPassError] = useState('');
    const [loading, setLoading] = useState(false);

    const switchMode = (m: Mode) => {
        setMode(m);
        setName('');
        setPassword('');
        setNameError('');
        setPassError('');
    };

    const validate = () => {
        let ok = true;
        const trimmed = name.trim();
        if (!trimmed || trimmed.length < 2) {
            setNameError('Username must be at least 2 characters.');
            ok = false;
        }
        if (!password || password.length < 3) {
            setPassError('Password must be at least 3 characters.');
            ok = false;
        }
        return ok;
    };

    const handleSubmit = async () => {
        if (!validate()) return;
        setLoading(true);
        try {
            const user = mode === 'signup'
                ? await signupUser(name.trim(), password)
                : await signinUser(name.trim(), password);
            onRegistered(user);
        } catch (err: unknown) {
            const msg = err instanceof Error ? err.message : 'Something went wrong.';
            // Show error under whichever field makes sense
            if (msg.toLowerCase().includes('username') || msg.toLowerCase().includes('user')) {
                setNameError(msg);
            } else {
                setPassError(msg);
            }
        } finally {
            setLoading(false);
        }
    };

    const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') handleSubmit();
    };

    return (
        <div className="modal-overlay">
            <div className="modal-card glass-panel">
                <div className="modal-icon">💬</div>
                <h2 className="modal-title">Welcome to Chat</h2>

                {/* Tab toggle */}
                <div className="modal-tabs">
                    <button
                        className={`modal-tab ${mode === 'signin' ? 'modal-tab--active' : ''}`}
                        onClick={() => switchMode('signin')}
                        disabled={loading}
                    >
                        Sign In
                    </button>
                    <button
                        className={`modal-tab ${mode === 'signup' ? 'modal-tab--active' : ''}`}
                        onClick={() => switchMode('signup')}
                        disabled={loading}
                    >
                        Sign Up
                    </button>
                </div>

                {/* Username */}
                <div className="modal-input-wrapper">
                    <input
                        id="username-input"
                        className={`modal-input ${nameError ? 'modal-input--error' : ''}`}
                        type="text"
                        placeholder="Enter your username…"
                        value={name}
                        autoFocus
                        maxLength={30}
                        disabled={loading}
                        onChange={(e) => { setName(e.target.value); setNameError(''); }}
                        onKeyDown={handleKeyDown}
                    />
                    {nameError && <p className="modal-error">{nameError}</p>}
                </div>

                {/* Password */}
                <div className="modal-input-wrapper">
                    <input
                        id="password-input"
                        className={`modal-input ${passError ? 'modal-input--error' : ''}`}
                        type="password"
                        placeholder="Enter password…"
                        value={password}
                        minLength={3}
                        maxLength={30}
                        disabled={loading}
                        onChange={(e) => { setPassword(e.target.value); setPassError(''); }}
                        onKeyDown={handleKeyDown}
                    />
                    {passError && <p className="modal-error">{passError}</p>}
                </div>

                <button
                    id="auth-submit-btn"
                    className="modal-btn"
                    onClick={handleSubmit}
                    disabled={!name.trim() || loading}
                >
                    {loading ? <span className="spinner" /> : mode === 'signup' ? 'Create Account' : 'Sign In'}
                </button>
            </div>
        </div>
    );
}
