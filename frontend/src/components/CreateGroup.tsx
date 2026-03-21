import { useState } from 'react';
import type { KeyboardEvent } from 'react';
import { X, Check } from 'lucide-react';
import type { User, Group } from '../types/chat';
import { registerGroup } from '../api';

interface CreateGroupProps {
    onGroupRegister: (group: Group) => void;
    onClose: () => void;
    users: User[];
    currentUser: User | null;
}

export function CreateGroup({ onGroupRegister, onClose, users, currentUser }: CreateGroupProps) {
    const [value, setValue] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [selectedMemberIds, setSelectedMemberIds] = useState<Set<string>>(new Set());

    const toggleMember = (userId: string) => {
        setSelectedMemberIds(prev => {
            const next = new Set(prev);
            if (next.has(userId)) {
                next.delete(userId);
            } else {
                next.add(userId);
            }
            return next;
        });
    };

    const handleSubmit = async () => {
        const trimmed = value.trim();
        if (!trimmed) {
            setError('Please enter a group name.');
            return;
        }
        if (trimmed.length < 2) {
            setError('Group name must be at least 2 characters.');
            return;
        }
        if (selectedMemberIds.size === 0) {
            setError('Please select at least one member.');
            return;
        }

        setLoading(true);
        setError('');
        try {
            // Always include the creator themselves in the members list
            const allMembers = Array.from(selectedMemberIds);
            if (currentUser && !allMembers.includes(currentUser.id)) {
                allMembers.push(currentUser.id);
            }
            const group = await registerGroup(trimmed, allMembers);
            onGroupRegister(group);
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : 'Group creation failed. Try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') handleSubmit();
    };

    return (
        <div className="modal-overlay">
            <div className="modal-card glass-panel" style={{ position: 'relative' }}>
                <button
                    className="icon-btn"
                    onClick={onClose}
                    style={{ position: 'absolute', top: '16px', right: '16px' }}
                    aria-label="Close modal"
                >
                    <X size={20} />
                </button>
                <div className="modal-icon">👥</div>
                <h2 className="modal-title">Create a Group</h2>

                <label htmlFor="group-name-input">
                    <p className="modal-subtitle">Group name</p>
                    <div className="modal-input-wrapper">
                        <input
                            id="group-name-input"
                            className={`modal-input ${error ? 'modal-input--error' : ''}`}
                            type="text"
                            placeholder="Enter group name…"
                            value={value}
                            autoFocus
                            maxLength={30}
                            disabled={loading}
                            onChange={(e) => { setValue(e.target.value); setError(''); }}
                            onKeyDown={handleKeyDown}
                        />
                        {error && <p className="modal-error">{error}</p>}
                    </div>
                </label>

                {/* Member selection */}
                <p className="modal-subtitle" style={{ marginTop: '12px' }}>
                    Select members ({selectedMemberIds.size} selected)
                </p>
                <div style={{ maxHeight: '200px', overflowY: 'auto', marginBottom: '12px' }}>
                    {users.map(user => {
                        const isSelected = selectedMemberIds.has(user.id);
                        return (
                            <div
                                key={user.id}
                                className={`contact-item ${isSelected ? 'active' : ''}`}
                                onClick={() => toggleMember(user.id)}
                                style={{ cursor: 'pointer', padding: '8px 12px' }}
                            >
                                <div className="avatar">
                                    <img
                                        src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(user.name)}`}
                                        alt={user.name}
                                    />
                                </div>
                                <div className="contact-info">
                                    <div className="contact-name-row">
                                        <span className="contact-name">{user.name}</span>
                                        {isSelected && <Check size={16} style={{ color: 'var(--accent, #6c63ff)' }} />}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                    {users.length === 0 && (
                        <p style={{ textAlign: 'center', opacity: 0.5, padding: '12px' }}>No other users available</p>
                    )}
                </div>

                <button
                    id="group-submit-btn"
                    className="modal-btn"
                    onClick={handleSubmit}
                    disabled={!value.trim() || loading}
                >
                    {loading ? <span className="spinner" /> : 'Create Group'}
                </button>
                <button
                    className="modal-btn secondary-btn"
                    onClick={onClose}
                    style={{ marginTop: '10px', backgroundColor: 'transparent', color: 'inherit', border: '1px solid #ccc' }}
                    disabled={loading}
                >
                    Cancel
                </button>
            </div>
        </div>
    );
}
