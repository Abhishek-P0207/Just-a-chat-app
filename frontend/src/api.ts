import type { User, Message, Group } from "./types/chat";

const BASE = "http://localhost:3000/api";

export async function registerUser(name: string, password: string): Promise<User> {
    const res = await fetch(`${BASE}/users/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, password }),
    });
    if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error((err as { error?: string }).error ?? "Registration failed");
    }
    return res.json();
}

export async function signupUser(name: string, password: string): Promise<User> {
    const res = await fetch(`${BASE}/users/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ name, password }),
    });
    if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error((err as { error?: string }).error ?? "Sign up failed");
    }
    const data = await res.json();
    return data.user ?? data;
}

export async function signinUser(name: string, password: string): Promise<User> {
    const res = await fetch(`${BASE}/users/signin`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ name, password }),
    });
    if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error((err as { error?: string }).error ?? "Invalid credentials");
    }
    return res.json();
}

export async function getUsers(): Promise<User[]> {
    const res = await fetch(`${BASE}/users`);
    if (!res.ok) throw new Error("Failed to fetch users");
    return res.json();
}

export async function getDmConversationId(userId1: string, userId2: string): Promise<string> {
    const res = await fetch(`${BASE}/conversations/dm`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ userId1, userId2 }),
    });
    if (!res.ok) throw new Error("Failed to get/create conversation");
    const data: { conversationId: string } = await res.json();
    return data.conversationId;
}

export async function getMessages(convId: string): Promise<Message[]> {
    const res = await fetch(`${BASE}/conversations/${convId}/messages`, {
        credentials: "include",
    });
    if (!res.ok) throw new Error("Failed to fetch messages");
    return res.json();
}

export async function registerGroup(name: string, members: string[]): Promise<Group> {
    const res = await fetch(`${BASE}/groups/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ name, members }),
    });
    if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error((err as { error?: string }).error ?? "Group creation failed");
    }
    const data: { conversationId: string; name: string; memberIds: string[] } = await res.json();
    return { id: data.conversationId, name: data.name, memberIds: data.memberIds, createdAt: new Date().toISOString() };
}

export async function getGroups(userId: string): Promise<Group[]> {
    const res = await fetch(`${BASE}/groups?userId=${encodeURIComponent(userId)}`, {
        credentials: "include",
    });
    if (!res.ok) throw new Error("Failed to fetch groups");
    const raw: { id: string; name: string | null; createdAt: string; participants: { userId: string }[] }[] = await res.json();
    return raw.map((g) => ({
        id: g.id,
        name: g.name ?? "Unnamed Group",
        memberIds: g.participants.map((p) => p.userId),
        createdAt: g.createdAt,
    }));
}

export async function getToken(roomName, username) {
    const res = await fetch(`${BASE}/call/getToken?room=${roomName}&username=${username}`, {
        credentials: "include",
    });
    return res.json();
}