interface IncomingCallModalProps {
    callerName: string;
    isGroup: boolean;
    callType: 'audio' | 'video';
    onAccept: () => void;
    onDecline: () => void;
}

export function IncomingCallModal({ callerName, isGroup, callType, onAccept, onDecline }: IncomingCallModalProps) {
    const icon = callType === 'video' ? '🎥' : '📞';
    const label = callType === 'video' ? 'Video Call' : 'Voice Call';

    return (
        <div style={{
            position: 'fixed',
            top: '20px',
            right: '20px',
            backgroundColor: '#2d2d2d',
            padding: '20px',
            borderRadius: '12px',
            zIndex: 1000,
            boxShadow: '0 8px 24px rgba(0,0,0,0.6)',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
            minWidth: '260px',
            border: '1px solid #444',
        }}>
            <h3 style={{ margin: 0, color: 'white', fontSize: '1.2rem' }}>{icon} Incoming {label}</h3>
            <p style={{ margin: 0, color: '#ccc', fontSize: '0.95rem' }}>
                <strong>{callerName}</strong> is calling you{isGroup ? ' in a group' : ''}...
            </p>
            <div style={{ display: 'flex', gap: '10px', marginTop: '12px' }}>
                <button
                    style={{ flex: 1, backgroundColor: '#28a745', color: 'white', border: 'none', padding: '10px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}
                    onClick={onAccept}
                >
                    ✅ Accept
                </button>
                <button
                    style={{ flex: 1, backgroundColor: '#dc3545', color: 'white', border: 'none', padding: '10px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}
                    onClick={onDecline}
                >
                    ❌ Decline
                </button>
            </div>
        </div>
    );
}
