import { useState, useEffect } from 'react';
import { LiveKitRoom, RoomAudioRenderer, ControlBar, VideoConference } from '@livekit/components-react';
import '@livekit/components-styles';
import { getToken } from '../api';

export default function GroupCall({ roomName, username, onLeave, callType }: {
    roomName: string,
    username: string | undefined,
    onLeave: () => void,
    callType: 'audio' | 'video',
}) {
    const [token, setToken] = useState("");

    useEffect(() => {
        const getAcessToken = async () => {
            try {
                const response = await getToken(roomName, username as string);
                setToken(response.token);
            } catch (err) {
                console.error("Failed to fetch token", err);
            }
        };
        getAcessToken();
    }, [roomName, username]);

    if (token === "") {
        return (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'white', gap: 12 }}>
                <span style={{ fontSize: '1.5rem' }}>{callType === 'video' ? '🎥' : '📞'}</span>
                <span>Connecting{callType === 'video' ? ' video' : ' voice'} call...</span>
            </div>
        );
    }

    if (callType === 'video') {
        return (
            <LiveKitRoom
                video={true}
                audio={true}
                token={token}
                serverUrl={import.meta.env.VITE_LIVEKIT_URL}
                connect={true}
                onDisconnected={onLeave}
                style={{ height: '100%' }}
            >
                <VideoConference />
            </LiveKitRoom>
        );
    }

    return (
        <LiveKitRoom
            video={false}
            audio={true}
            token={token}
            serverUrl={import.meta.env.VITE_LIVEKIT_URL}
            connect={true}
            onDisconnected={onLeave}
            style={{ display: 'flex', flexDirection: 'column', height: '100%', justifyContent: 'center', alignItems: 'center' }}
        >
            <div style={{ color: 'white', fontSize: '1.2rem', marginBottom: '20px' }}>
                📞 Voice Call in Progress...
            </div>
            <ControlBar controls={{ camera: false, screenShare: false, chat: false }} />
            <RoomAudioRenderer />
        </LiveKitRoom>
    );
}