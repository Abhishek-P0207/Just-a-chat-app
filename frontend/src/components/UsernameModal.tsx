import { useState } from 'react';
import type { KeyboardEvent } from 'react';
import type { User } from '../types/chat';
import { registerUser } from '../api';

interface UsernameModalProps {
    onRegistered: (user: User) => void;
}

export function UsernameModal({ onRegistered }: UsernameModalProps) {
    const [value, setValue] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async () => {
        const trimmed = value.trim();
        if (!trimmed) {
            setError('Please enter a username.');
            return;
        }
        if (trimmed.length < 2) {
            setError('Username must be at least 2 characters.');
            return;
        }

        setLoading(true);
        setError('');
        try {
            const user = await registerUser(trimmed);
            onRegistered(user);
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : 'Registration failed. Try again.');
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
                <p className="modal-subtitle">Choose a username to get started</p>

                <div className="modal-input-wrapper">
                    <input
                        id="username-input"
                        className={`modal-input ${error ? 'modal-input--error' : ''}`}
                        type="text"
                        placeholder="Enter your username…"
                        value={value}
                        autoFocus
                        maxLength={30}
                        disabled={loading}
                        onChange={(e) => { setValue(e.target.value); setError(''); }}
                        onKeyDown={handleKeyDown}
                    />
                    {error && <p className="modal-error">{error}</p>}
                </div>

                <button
                    id="username-submit-btn"
                    className="modal-btn"
                    onClick={handleSubmit}
                    disabled={!value.trim() || loading}
                >
                    {loading ? <span className="spinner" /> : 'Join Chat'}
                </button>
            </div>
        </div>
    );
}
