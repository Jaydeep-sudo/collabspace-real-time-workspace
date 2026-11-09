
"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";

interface User {
    id: string;
    name: string;
    email: string;
}

interface Workspace {
    id: string;
    name: string;
    createdAt: string;
    memberships?: {
        role: string;
        user: {
            id: string;
            name: string;
            email: string;
        };
    }[];
    _count?: {
        documents: number;
    };
}

export default function HomePage() {
    const router = useRouter();

    const [user, setUser] = useState<User | null>(null);
    const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
    const [workspaceName, setWorkspaceName] = useState("");
    const [loading, setLoading] = useState(true);
    const [creating, setCreating] = useState(false);
    const [loggingOut, setLoggingOut] = useState(false);
    const [message, setMessage] = useState("");
    const [messageType, setMessageType] = useState<"success" | "error">("success");

    async function loadWorkspaces() {
        const response = await fetch("/api/workspaces");
        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || "Unable to load workspaces.");
        }

        setWorkspaces(data.workspaces || []);
    }

    useEffect(() => {
        async function initializeDashboard() {
            try {
                const response = await fetch("/api/me");
                const data = await response.json();

                if (!response.ok) {
                    router.replace("/login");
                    return;
                }

                setUser(data.user);
                await loadWorkspaces();
            } catch (error) {
                console.error(error);
                setMessage("Unable to load your dashboard. Please refresh.");
                setMessageType("error");
            } finally {
                setLoading(false);
            }
        }

        initializeDashboard();
    }, [router]);

    async function handleCreateWorkspace(e: FormEvent<HTMLFormElement>) {
        e.preventDefault();

        const name = workspaceName.trim();

        if (!name) {
            setMessage("Please enter a workspace name.");
            setMessageType("error");
            return;
        }

        setCreating(true);
        setMessage("");

        try {
            const response = await fetch("/api/workspaces", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ name }),
            });

            const data = await response.json();

            if (!response.ok) {
                setMessage(data.message || "Workspace creation failed.");
                setMessageType("error");
                return;
            }

            setWorkspaceName("");
            await loadWorkspaces();

            setMessage("Your workspace has been created successfully!");
            setMessageType("success");
        } catch (error) {
            console.error(error);
            setMessage("Something went wrong. Please try again.");
            setMessageType("error");
        } finally {
            setCreating(false);
        }
    }

    async function handleLogout() {
        setLoggingOut(true);

        try {
            const response = await fetch("/api/auth/logout", {
                method: "POST",
            });

            if (!response.ok) {
                throw new Error("Logout failed.");
            }

            router.replace("/login");
            router.refresh();
        } catch (error) {
            console.error(error);
            setMessage("Unable to log out. Please try again.");
            setMessageType("error");
            setLoggingOut(false);
        }
    }

    if (loading) {
        return (
            <main className="loading-screen">
                <div className="loader" />
                <p>Preparing your workspace...</p>

                <style jsx global>{`
                    body {
                        margin: 0;
                        background: #f8fafc;
                        color: #172033;
                        font-family: Arial, sans-serif;
                    }

                    .loading-screen {
                        min-height: 100vh;
                        display: flex;
                        flex-direction: column;
                        align-items: center;
                        justify-content: center;
                        gap: 15px;
                        color: #64748b;
                    }

                    .loader {
                        width: 35px;
                        height: 35px;
                        border: 4px solid #dbeafe;
                        border-top-color: #4f46e5;
                        border-radius: 50%;
                        animation: spin 0.8s linear infinite;
                    }

                    @keyframes spin {
                        to { transform: rotate(360deg); }
                    }
                `}</style>
            </main>
        );
    }

    if (!user) return null;

    const firstName = user.name?.trim().split(/\s+/)[0] || "there";

    return (
        <div className="app-shell">
            <aside className="sidebar">
                <a href="/" className="brand">
                    <span className="brand-icon">✦</span>
                    <span>CollabSpace</span>
                </a>

                <div className="sidebar-label">WORKSPACE</div>

                <a href="/" className="nav-link active">
                    <span>▦</span>
                    Overview
                </a>

                <a href="#workspaces" className="nav-link">
                    <span>▣</span>
                    My Workspaces
                </a>

                <a href="/api" className="nav-link">
                    <span>⌘</span>
                    API Explorer
                </a>

                <div className="sidebar-bottom">
                    <div className="help-card">
                        <div className="help-icon">✧</div>
                        <strong>Build something great</strong>
                        <p>Your ideas deserve a space of their own.</p>
                    </div>

                    <div className="profile">
                        <div className="avatar">
                            {user.name?.charAt(0).toUpperCase() || "U"}
                        </div>
                        <div className="profile-info">
                            <strong>{user.name}</strong>
                            <span>{user.email}</span>
                        </div>
                    </div>
                </div>
            </aside>

            <main className="main-content">
                <header className="topbar">
                    <div className="breadcrumb">
                        <span>Workspace</span>
                        <span className="breadcrumb-separator">/</span>
                        <strong>Overview</strong>
                    </div>

                    <div className="topbar-actions">
                        <a href="/api" className="api-link">
                            <span>⌘</span> API Explorer
                        </a>

                        <button
                            className="logout-button"
                            onClick={handleLogout}
                            disabled={loggingOut}
                        >
                            {loggingOut ? "Logging out..." : "↗ Logout"}
                        </button>
                    </div>
                </header>

                <div className="page-container">
                    <section className="welcome-section">
                        <div>
                            <div className="eyebrow">
                                <span className="status-dot" />
                                YOUR COLLABORATIVE SPACE
                            </div>

                            <h1>
                                Welcome back, {firstName}! <span>👋</span>
                            </h1>

                            <p>
                                Bring your team together and turn your ideas
                                into something amazing.
                            </p>
                        </div>

                        <div className="welcome-decoration">✦</div>
                    </section>

                    {message && (
                        <div className={`message ${messageType}`}>
                            <span>{messageType === "success" ? "✓" : "!"}</span>
                            {message}
                            <button onClick={() => setMessage("")}>×</button>
                        </div>
                    )}

                    <section className="stats-grid">
                        <div className="stat-card">
                            <div className="stat-icon purple">▦</div>
                            <div>
                                <span>Total workspaces</span>
                                <h2>{workspaces.length}</h2>
                            </div>
                        </div>

                        <div className="stat-card">
                            <div className="stat-icon blue">▤</div>
                            <div>
                                <span>Total documents</span>
                                <h2>
                                    {workspaces.reduce(
                                        (total, workspace) =>
                                            total + (workspace._count?.documents ?? 0),
                                        0
                                    )}
                                </h2>
                            </div>
                        </div>

                        <div className="stat-card">
                            <div className="stat-icon green">✓</div>
                            <div>
                                <span>Account status</span>
                                <h2 className="active-status">Active</h2>
                            </div>
                        </div>
                    </section>

                    <section className="create-section">
                        <div className="section-heading">
                            <div>
                                <h2>Create a workspace</h2>
                                <p>Start a new space for your ideas and projects.</p>
                            </div>
                            <div className="create-symbol">＋</div>
                        </div>

                        <form onSubmit={handleCreateWorkspace} className="create-form">
                            <div className="input-wrapper">
                                <span>▣</span>
                                <input
                                    type="text"
                                    placeholder="Give your workspace a name..."
                                    value={workspaceName}
                                    onChange={(e) => setWorkspaceName(e.target.value)}
                                    maxLength={60}
                                    required
                                />
                            </div>

                            <button type="submit" disabled={creating}>
                                {creating ? "Creating..." : "＋ Create workspace"}
                            </button>
                        </form>
                    </section>

                    <section className="workspace-section" id="workspaces">
                        <div className="section-heading workspace-heading">
                            <div>
                                <h2>My workspaces</h2>
                                <p>All the spaces you own or collaborate in.</p>
                            </div>
                            <span className="count-badge">
                                {workspaces.length} {workspaces.length === 1 ? "workspace" : "workspaces"}
                            </span>
                        </div>

                        {workspaces.length === 0 ? (
                            <div className="empty-state">
                                <div className="empty-icon">▦</div>
                                <h3>No workspaces yet</h3>
                                <p>Create your first workspace to get started.</p>
                            </div>
                        ) : (
                            <div className="workspace-grid">
                                {workspaces.map((workspace, index) => {
                                    const role =
                                        workspace.memberships?.find(
                                            (membership) =>
                                                membership.user.id === user.id
                                        )?.role || "MEMBER";

                                    return (
                                        <article className="workspace-card" key={workspace.id}>
                                            <div className="workspace-card-top">
                                                <div className={`workspace-icon color-${index % 4}`}>
                                                    {workspace.name.charAt(0).toUpperCase()}
                                                </div>

                                                <span className="role-badge">{role}</span>
                                            </div>

                                            <h3>{workspace.name}</h3>
                                            <p className="workspace-description">
                                                Your collaborative workspace
                                            </p>

                                            <div className="workspace-meta">
                                                <span>▤ {workspace._count?.documents ?? 0} documents</span>
                                                <span>
                                                    {new Date(workspace.createdAt).toLocaleDateString()}
                                                </span>
                                            </div>

                                            <div className="card-footer">
                                                <span>Workspace created</span>
                                                <span className="card-arrow">✦</span>
                                            </div>
                                        </article>
                                    );
                                })}
                            </div>
                        )}
                    </section>

                    <footer className="footer">
                        <span>© 2026 CollabSpace</span>
                        <span>Made for better collaboration ✦</span>
                    </footer>
                </div>
            </main>

            <style jsx global>{`
                * {
                    box-sizing: border-box;
                }

                html {
                    scroll-behavior: smooth;
                }

                body {
                    margin: 0;
                    background: #f8fafc;
                    color: #172033;
                    font-family: Arial, Helvetica, sans-serif;
                    color-scheme: light;
                }

                button, input {
                    font: inherit;
                }

                .app-shell {
                    min-height: 100vh;
                    display: flex;
                    background: #f8fafc;
                }

                .sidebar {
                    width: 255px;
                    flex-shrink: 0;
                    min-height: 100vh;
                    background: #fff;
                    border-right: 1px solid #e8edf4;
                    padding: 28px 18px;
                    display: flex;
                    flex-direction: column;
                }

                .brand {
                    display: flex;
                    align-items: center;
                    gap: 11px;
                    padding: 4px 9px 38px;
                    color: #172033;
                    font-size: 21px;
                    font-weight: 800;
                    text-decoration: none;
                    letter-spacing: -0.7px;
                }

                .brand-icon {
                    width: 34px;
                    height: 34px;
                    display: grid;
                    place-items: center;
                    color: white;
                    background: linear-gradient(135deg, #6558ed, #9b65ee);
                    border-radius: 11px;
                    font-size: 22px;
                }

                .sidebar-label {
                    padding: 0 11px;
                    margin-bottom: 13px;
                    font-size: 10px;
                    font-weight: 800;
                    letter-spacing: 1.4px;
                    color: #9aa5b5;
                }

                .nav-link {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    padding: 12px;
                    margin-bottom: 5px;
                    color: #64748b;
                    font-size: 14px;
                    font-weight: 600;
                    text-decoration: none;
                    border-radius: 9px;
                    transition: 0.2s;
                }

                .nav-link span {
                    font-size: 18px;
                }

                .nav-link:hover,
                .nav-link.active {
                    color: #5548d9;
                    background: #f0efff;
                }

                .sidebar-bottom {
                    margin-top: auto;
                }

                .help-card {
                    padding: 17px;
                    background: linear-gradient(145deg, #f2f0ff, #f8f5ff);
                    border: 1px solid #e9e4ff;
                    border-radius: 12px;
                    margin-bottom: 22px;
                }

                .help-icon {
                    color: #6958df;
                    font-size: 22px;
                    margin-bottom: 12px;
                }

                .help-card strong {
                    font-size: 13px;
                }

                .help-card p {
                    color: #7b8495;
                    font-size: 11px;
                    line-height: 1.6;
                    margin-bottom: 0;
                }

                .profile {
                    display: flex;
                    align-items: center;
                    gap: 11px;
                    border-top: 1px solid #edf0f5;
                    padding: 18px 4px 0;
                }

                .avatar {
                    width: 39px;
                    height: 39px;
                    display: grid;
                    place-items: center;
                    border-radius: 50%;
                    background: #e9e7ff;
                    color: #5c4bd7;
                    font-weight: 800;
                }

                .profile-info {
                    display: flex;
                    flex-direction: column;
                    gap: 5px;
                    min-width: 0;
                }

                .profile-info strong {
                    font-size: 12px;
                }

                .profile-info span {
                    color: #8b95a5;
                    font-size: 10px;
                    overflow-wrap: anywhere;
                }

                .main-content {
                    flex: 1;
                    min-width: 0;
                }

                .topbar {
                    min-height: 75px;
                    padding: 0 42px;
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    gap: 15px;
                    background: white;
                    border-bottom: 1px solid #e8edf4;
                }

                .breadcrumb {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    color: #94a0b0;
                    font-size: 13px;
                }

                .breadcrumb strong {
                    color: #27334a;
                }

                .breadcrumb-separator {
                    color: #cbd2dd;
                }

                .topbar-actions {
                    display: flex;
                    align-items: center;
                    gap: 20px;
                }

                .api-link {
                    color: #64748b;
                    text-decoration: none;
                    font-size: 13px;
                    font-weight: 600;
                }

                .logout-button {
                    background: white;
                    color: #64748b;
                    border: 1px solid #e2e8f0;
                    border-radius: 8px;
                    padding: 9px 14px;
                    font-size: 12px;
                    cursor: pointer;
                }

                .logout-button:hover {
                    background: #fff1f2;
                    color: #dc2626;
                }

                .page-container {
                    max-width: 1200px;
                    padding: 38px 42px;
                    margin: 0 auto;
                }

                .welcome-section {
                    min-height: 155px;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    position: relative;
                    overflow: hidden;
                    padding: 28px 32px;
                    color: white;
                    background: linear-gradient(110deg, #5145cd, #7862e9 65%, #9a70e9);
                    border-radius: 16px;
                    margin-bottom: 25px;
                }

                .eyebrow {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    color: #e1dcff;
                    font-size: 10px;
                    font-weight: 800;
                    letter-spacing: 1.4px;
                }

                .status-dot {
                    width: 7px;
                    height: 7px;
                    background: #86efac;
                    border-radius: 50%;
                }

                .welcome-section h1 {
                    font-size: clamp(22px, 3vw, 30px);
                    letter-spacing: -0.8px;
                    margin: 13px 0 9px;
                }

                .welcome-section h1 span {
                    font-size: 22px;
                }

                .welcome-section p {
                    color: #e4e0ff;
                    font-size: 13px;
                    margin: 0;
                    line-height: 1.6;
                }

                .welcome-decoration {
                    position: absolute;
                    right: 65px;
                    top: -48px;
                    color: rgba(255,255,255,0.12);
                    font-size: 210px;
                    transform: rotate(15deg);
                    pointer-events: none;
                }

                .message {
                    padding: 13px 16px;
                    border-radius: 9px;
                    font-size: 13px;
                    margin-bottom: 20px;
                    display: flex;
                    align-items: center;
                    gap: 10px;
                }

                .message.success {
                    color: #166534;
                    background: #f0fdf4;
                    border: 1px solid #bbf7d0;
                }

                .message.error {
                    color: #b91c1c;
                    background: #fef2f2;
                    border: 1px solid #fecaca;
                }

                .message button {
                    margin-left: auto;
                    border: 0;
                    background: transparent;
                    color: inherit;
                    font-size: 19px;
                    cursor: pointer;
                }

                .stats-grid {
                    display: grid;
                    grid-template-columns: repeat(3, minmax(0, 1fr));
                    gap: 16px;
                    margin-bottom: 25px;
                }

                .stat-card {
                    display: flex;
                    align-items: center;
                    gap: 15px;
                    padding: 20px;
                    background: white;
                    border: 1px solid #e9edf3;
                    border-radius: 12px;
                    box-shadow: 0 2px 8px rgba(25, 35, 60, 0.025);
                }

                .stat-icon {
                    width: 43px;
                    height: 43px;
                    display: grid;
                    place-items: center;
                    border-radius: 11px;
                    font-size: 20px;
                }

                .stat-icon.purple {
                    color: #6755df;
                    background: #f0edff;
                }

                .stat-icon.blue {
                    color: #2780d8;
                    background: #eaf4ff;
                }

                .stat-icon.green {
                    color: #15945c;
                    background: #e8f9f0;
                }

                .stat-card span {
                    color: #8490a2;
                    font-size: 11px;
                }

                .stat-card h2 {
                    margin: 6px 0 0;
                    font-size: 24px;
                    letter-spacing: -0.5px;
                }

                .stat-card .active-status {
                    color: #15945c;
                    font-size: 19px;
                }

                .create-section {
                    background: white;
                    padding: 23px;
                    border: 1px solid #e9edf3;
                    border-radius: 12px;
                    margin-bottom: 32px;
                    box-shadow: 0 2px 8px rgba(25, 35, 60, 0.025);
                }

                .section-heading {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    gap: 15px;
                }

                .section-heading h2 {
                    font-size: 17px;
                    letter-spacing: -0.3px;
                    margin: 0 0 7px;
                }

                .section-heading p {
                    color: #8b96a6;
                    font-size: 12px;
                    margin: 0;
                }

                .create-symbol {
                    width: 38px;
                    height: 38px;
                    display: grid;
                    place-items: center;
                    color: #6555df;
                    background: #f0efff;
                    border-radius: 10px;
                    font-size: 23px;
                }

                .create-form {
                    display: flex;
                    gap: 12px;
                    margin-top: 22px;
                }

                .input-wrapper {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    flex: 1;
                    min-width: 0;
                    padding: 0 14px;
                    border: 1px solid #e0e6ef;
                    border-radius: 8px;
                    color: #9ba5b5;
                    transition: 0.2s;
                }

                .input-wrapper:focus-within {
                    border-color: #7666e9;
                    box-shadow: 0 0 0 3px #7666e91a;
                }

                .input-wrapper input {
                    width: 100%;
                    min-width: 0;
                    border: 0;
                    outline: 0;
                    background: transparent;
                    color: #172033;
                    padding: 13px 0;
                    font-size: 13px;
                }

                .input-wrapper input::placeholder {
                    color: #a4adba;
                }

                .create-form button {
                    padding: 0 20px;
                    border: 0;
                    border-radius: 8px;
                    color: white;
                    background: #6253df;
                    font-size: 12px;
                    font-weight: 700;
                    cursor: pointer;
                    white-space: nowrap;
                    transition: 0.2s;
                }

                .create-form button:hover {
                    background: #5042c7;
                    transform: translateY(-1px);
                }

                .create-form button:disabled {
                    opacity: 0.6;
                    cursor: not-allowed;
                    transform: none;
                }

                .workspace-section {
                    margin-bottom: 35px;
                }

                .workspace-heading {
                    margin-bottom: 18px;
                }

                .count-badge {
                    color: #6655dc;
                    background: #f0efff;
                    border-radius: 20px;
                    padding: 7px 12px;
                    font-size: 11px;
                    font-weight: 700;
                }

                .workspace-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(245px, 1fr));
                    gap: 16px;
                }

                .workspace-card {
                    background: white;
                    border: 1px solid #e9edf3;
                    border-radius: 12px;
                    padding: 19px;
                    transition: 0.2s;
                }

                .workspace-card:hover {
                    border-color: #c9c2ff;
                    box-shadow: 0 8px 25px rgba(48, 38, 120, 0.07);
                    transform: translateY(-3px);
                }

                .workspace-card-top {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }

                .workspace-icon {
                    width: 43px;
                    height: 43px;
                    display: grid;
                    place-items: center;
                    border-radius: 11px;
                    font-size: 19px;
                    font-weight: 800;
                }

                .workspace-icon.color-0 {
                    color: #6252d7;
                    background: #f0edff;
                }

                .workspace-icon.color-1 {
                    color: #1d80c9;
                    background: #e9f5ff;
                }

                .workspace-icon.color-2 {
                    color: #16845b;
                    background: #e9f9f1;
                }

                .workspace-icon.color-3 {
                    color: #c17a28;
                    background: #fff5e8;
                }

                .role-badge {
                    padding: 6px 9px;
                    border-radius: 20px;
                    color: #16845b;
                    background: #e9f9f1;
                    font-size: 9px;
                    font-weight: 800;
                    letter-spacing: 0.4px;
                }

                .workspace-card h3 {
                    margin: 19px 0 7px;
                    font-size: 16px;
                }

                .workspace-description {
                    color: #909aaa;
                    font-size: 11px;
                    margin: 0 0 20px;
                }

                .workspace-meta {
                    display: flex;
                    justify-content: space-between;
                    gap: 8px;
                    color: #7d899a;
                    font-size: 10px;
                    padding-bottom: 16px;
                    border-bottom: 1px solid #edf0f5;
                }

                .card-footer {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding-top: 14px;
                    color: #a0a9b7;
                    font-size: 10px;
                }

                .card-arrow {
                    color: #6959dc;
                    font-size: 17px;
                }

                .empty-state {
                    text-align: center;
                    background: white;
                    padding: 45px 20px;
                    border: 1px dashed #dce2ec;
                    border-radius: 12px;
                }

                .empty-icon {
                    width: 55px;
                    height: 55px;
                    display: grid;
                    place-items: center;
                    margin: 0 auto 15px;
                    color: #6c5ce7;
                    background: #f0efff;
                    border-radius: 15px;
                    font-size: 25px;
                }

                .empty-state h3 {
                    font-size: 15px;
                    margin: 0 0 7px;
                }

                .empty-state p {
                    color: #8b96a6;
                    font-size: 12px;
                    margin: 0;
                }

                .footer {
                    display: flex;
                    justify-content: space-between;
                    gap: 10px;
                    border-top: 1px solid #e8edf4;
                    padding-top: 20px;
                    color: #a0a9b7;
                    font-size: 10px;
                }

                @media (max-width: 850px) {
                    .sidebar {
                        width: 205px;
                    }

                    .page-container {
                        padding: 28px 22px;
                    }

                    .topbar {
                        padding: 0 22px;
                    }

                    .stats-grid {
                        grid-template-columns: repeat(2, minmax(0, 1fr));
                    }
                }

                @media (max-width: 600px) {
                    .sidebar {
                        display: none;
                    }

                    .topbar {
                        min-height: 65px;
                        padding: 0 16px;
                    }

                    .topbar-actions {
                        gap: 10px;
                    }

                    .page-container {
                        padding: 20px 15px;
                    }

                    .welcome-section {
                        padding: 23px 20px;
                    }

                    .welcome-decoration {
                        right: -25px;
                        font-size: 140px;
                    }

                    .stats-grid {
                        grid-template-columns: 1fr;
                    }

                    .create-section {
                        padding: 18px;
                    }

                    .create-form {
                        flex-direction: column;
                    }

                    .create-form button {
                        min-height: 45px;
                    }

                    .workspace-grid {
                        grid-template-columns: 1fr;
                    }

                    .api-link {
                        display: none;
                    }

                    .footer {
                        flex-direction: column;
                    }
                }
            `}</style>
        </div>
    );
}
