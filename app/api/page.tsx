"use client";

import { useMemo, useState } from "react";

type Endpoint = {
    name: string;
    method: string;
    path: string;
    description: string;
    category: string;
};

const endpoints: Endpoint[] = [
    {
        name: "User Registration",
        method: "POST",
        path: "/api/auth/register",
        description: "Create a new CollabSpace user account.",
        category: "Authentication",
    },
    {
        name: "User Login",
        method: "POST",
        path: "/api/auth/login",
        description: "Authenticate users and create a login session.",
        category: "Authentication",
    },
    {
        name: "User Logout",
        method: "POST",
        path: "/api/auth/logout",
        description: "End the current user's session.",
        category: "Authentication",
    },
    {
        name: "Current User",
        method: "GET",
        path: "/api/me",
        description: "Retrieve the currently authenticated user's profile.",
        category: "Users",
    },
    {
        name: "List Workspaces",
        method: "GET",
        path: "/api/workspaces",
        description: "Retrieve all workspaces accessible to the current user.",
        category: "Workspaces",
    },
    {
        name: "Create Workspace",
        method: "POST",
        path: "/api/workspaces",
        description: "Create a workspace and assign its creator as owner.",
        category: "Workspaces",
    },
    {
        name: "Database Connection",
        method: "GET",
        path: "/api/test-db",
        description: "Check whether the application can connect to PostgreSQL.",
        category: "System",
    },
];

const methodColors: Record<string, string> = {
    GET: "#15803d",
    POST: "#2563eb",
    PUT: "#b45309",
    DELETE: "#dc2626",
};

export default function ApiHomePage() {
    const [search, setSearch] = useState("");
    const [category, setCategory] = useState("All");
    const [response, setResponse] = useState<Record<string, string>>({});
    const [testing, setTesting] = useState<string | null>(null);

    const categories = ["All", "Authentication", "Users", "Workspaces", "System"];

    const filteredEndpoints = useMemo(() => {
        return endpoints.filter((endpoint) => {
            const matchesSearch =
                endpoint.name.toLowerCase().includes(search.toLowerCase()) ||
                endpoint.path.toLowerCase().includes(search.toLowerCase()) ||
                endpoint.description.toLowerCase().includes(search.toLowerCase());

            const matchesCategory =
                category === "All" || endpoint.category === category;

            return matchesSearch && matchesCategory;
        });
    }, [search, category]);

    async function testEndpoint(endpoint: Endpoint) {
        if (endpoint.method !== "GET") {
            setResponse((previous) => ({
                ...previous,
                [endpoint.path + endpoint.name]:
                    "This endpoint requires a POST request with a JSON body. Use your login, registration, or workspace form to test it.",
            }));
            return;
        }

        setTesting(endpoint.path + endpoint.name);

        try {
            const result = await fetch(endpoint.path);
            const data = await result.json();

            setResponse((previous) => ({
                ...previous,
                [endpoint.path + endpoint.name]: JSON.stringify(data, null, 2),
            }));
        } catch {
            setResponse((previous) => ({
                ...previous,
                [endpoint.path + endpoint.name]: "Unable to connect to this endpoint.",
            }));
        } finally {
            setTesting(null);
        }
    }

    return (
        <div style={{
            minHeight: "100vh",
            background: "#f8fafc",
            color: "#0f172a",
            fontFamily: "Arial, sans-serif",
        }}>
            <div style={{
                display: "flex",
                minHeight: "100vh",
            }}>
                <aside style={{
                    width: "235px",
                    flexShrink: 0,
                    background: "#111827",
                    color: "white",
                    padding: "28px 18px",
                }}>
                    <h2 style={{ fontSize: "23px", marginBottom: "8px" }}>
                        ✦ CollabSpace
                    </h2>
                    <p style={{
                        color: "#9ca3af",
                        fontSize: "12px",
                        marginBottom: "40px",
                    }}>
                        DEVELOPER CONSOLE
                    </p>

                    <p style={{
                        color: "#9ca3af",
                        fontSize: "11px",
                        fontWeight: "bold",
                        marginBottom: "12px",
                    }}>
                        MAIN MENU
                    </p>

                    <a href="/" style={navStyle}>
                        <span>⌂</span> Dashboard
                    </a>

                    <a href="/api" style={{
                        ...navStyle,
                        background: "#25334a",
                        color: "white",
                    }}>
                        <span>▤</span> API Explorer
                    </a>

                    <div style={{
                        marginTop: "45px",
                        borderTop: "1px solid #374151",
                        paddingTop: "20px",
                    }}>
                        <p style={{ color: "#9ca3af", fontSize: "12px" }}>
                            PROJECT STATUS
                        </p>
                        <p style={{ color: "#86efac", fontSize: "13px" }}>
                            ● Development
                        </p>
                        <p style={{ color: "#9ca3af", fontSize: "12px" }}>
                            Next.js · Prisma · PostgreSQL
                        </p>
                    </div>
                </aside>

                <main style={{
                    flex: 1,
                    minWidth: 0,
                    padding: "35px",
                }}>
                    <header style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        flexWrap: "wrap",
                        gap: "15px",
                        marginBottom: "35px",
                    }}>
                        <div>
                            <h1 style={{ fontSize: "28px", margin: 0 }}>
                                API Explorer
                            </h1>
                            <p style={{ color: "#64748b", fontSize: "14px" }}>
                                Manage and explore your application endpoints.
                            </p>
                        </div>

                        <a href="/" style={{
                            textDecoration: "none",
                            background: "#2563eb",
                            color: "white",
                            padding: "11px 17px",
                            borderRadius: "8px",
                            fontSize: "14px",
                        }}>
                            ← Back to Dashboard
                        </a>
                    </header>

                    <section style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(auto-fit, minmax(170px, 1fr))",
                        gap: "16px",
                        marginBottom: "30px",
                    }}>
                        {[
                            { label: "Total Endpoints", value: endpoints.length, icon: "▤" },
                            { label: "GET Requests", value: endpoints.filter(e => e.method === "GET").length, icon: "↓" },
                            { label: "POST Requests", value: endpoints.filter(e => e.method === "POST").length, icon: "↑" },
                            { label: "API Categories", value: categories.length - 1, icon: "▦" },
                        ].map((item) => (
                            <div key={item.label} style={{
                                background: "white",
                                border: "1px solid #e2e8f0",
                                borderRadius: "12px",
                                padding: "20px",
                            }}>
                                <p style={{ color: "#64748b", fontSize: "13px" }}>
                                    {item.icon} {item.label}
                                </p>
                                <h2 style={{ fontSize: "28px", margin: "8px 0 0" }}>
                                    {item.value}
                                </h2>
                            </div>
                        ))}
                    </section>

                    <section style={{
                        background: "white",
                        border: "1px solid #e2e8f0",
                        borderRadius: "12px",
                        padding: "22px",
                        marginBottom: "25px",
                    }}>
                        <h2 style={{ fontSize: "18px", marginTop: 0 }}>
                            Find an endpoint
                        </h2>

                        <input
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Search by endpoint name, path, or description..."
                            style={{
                                width: "100%",
                                boxSizing: "border-box",
                                padding: "13px",
                                border: "1px solid #cbd5e1",
                                borderRadius: "8px",
                                fontSize: "14px",
                                marginBottom: "16px",
                            }}
                        />

                        <div style={{
                            display: "flex",
                            flexWrap: "wrap",
                            gap: "8px",
                        }}>
                            {categories.map((item) => (
                                <button
                                    key={item}
                                    onClick={() => setCategory(item)}
                                    style={{
                                        border: "1px solid #cbd5e1",
                                        background: category === item ? "#2563eb" : "white",
                                        color: category === item ? "white" : "#475569",
                                        borderRadius: "20px",
                                        padding: "8px 14px",
                                        cursor: "pointer",
                                    }}
                                >
                                    {item}
                                </button>
                            ))}
                        </div>
                    </section>

                    <section style={{
                        background: "white",
                        border: "1px solid #e2e8f0",
                        borderRadius: "12px",
                        overflow: "hidden",
                    }}>
                        <div style={{
                            padding: "20px",
                            borderBottom: "1px solid #e2e8f0",
                        }}>
                            <h2 style={{ fontSize: "18px", margin: 0 }}>
                                Available Endpoints ({filteredEndpoints.length})
                            </h2>
                        </div>

                        {filteredEndpoints.length === 0 ? (
                            <p style={{ padding: "25px", color: "#64748b" }}>
                                No matching endpoints found.
                            </p>
                        ) : (
                            filteredEndpoints.map((endpoint) => {
                                const key = endpoint.path + endpoint.name;

                                return (
                                    <div key={key} style={{
                                        padding: "20px",
                                        borderBottom: "1px solid #e2e8f0",
                                    }}>
                                        <div style={{
                                            display: "flex",
                                            justifyContent: "space-between",
                                            alignItems: "center",
                                            flexWrap: "wrap",
                                            gap: "12px",
                                        }}>
                                            <div style={{
                                                display: "flex",
                                                alignItems: "center",
                                                gap: "12px",
                                                flexWrap: "wrap",
                                            }}>
                                                <span style={{
                                                    background: "#eff6ff",
                                                    color: "#1d4ed8",
                                                    padding: "5px 9px",
                                                    borderRadius: "5px",
                                                    fontSize: "11px",
                                                    fontWeight: "bold",
                                                }}>
                                                    {endpoint.category}
                                                </span>

                                                <h3 style={{
                                                    margin: 0,
                                                    fontSize: "16px",
                                                }}>
                                                    {endpoint.name}
                                                </h3>
                                            </div>

                                            <button
                                                onClick={() => testEndpoint(endpoint)}
                                                disabled={testing === key}
                                                style={{
                                                    background: "#0f172a",
                                                    color: "white",
                                                    border: "none",
                                                    borderRadius: "7px",
                                                    padding: "9px 14px",
                                                    cursor: "pointer",
                                                }}
                                            >
                                                {testing === key ? "Testing..." : "Test endpoint"}
                                            </button>
                                        </div>

                                        <div style={{
                                            display: "flex",
                                            gap: "10px",
                                            alignItems: "center",
                                            flexWrap: "wrap",
                                            margin: "14px 0",
                                        }}>
                                            <span style={{
                                                color: methodColors[endpoint.method] || "#475569",
                                                fontWeight: "bold",
                                                fontSize: "12px",
                                            }}>
                                                {endpoint.method}
                                            </span>
                                            <code style={{
                                                color: "#334155",
                                                background: "#f1f5f9",
                                                padding: "7px 10px",
                                                borderRadius: "5px",
                                                fontSize: "13px",
                                            }}>
                                                {endpoint.path}
                                            </code>
                                        </div>

                                        <p style={{
                                            color: "#64748b",
                                            fontSize: "13px",
                                            margin: 0,
                                        }}>
                                            {endpoint.description}
                                        </p>

                                        {response[key] && (
                                            <pre style={{
                                                background: "#0f172a",
                                                color: "#bbf7d0",
                                                padding: "15px",
                                                borderRadius: "8px",
                                                marginTop: "15px",
                                                whiteSpace: "pre-wrap",
                                                overflowWrap: "anywhere",
                                                fontSize: "12px",
                                            }}>
                                                {response[key]}
                                            </pre>
                                        )}
                                    </div>
                                );
                            })
                        )}
                    </section>

                    <footer style={{
                        textAlign: "center",
                        color: "#94a3b8",
                        fontSize: "12px",
                        padding: "25px",
                    }}>
                        CollabSpace Developer Console · Built with Next.js and Prisma
                    </footer>
                </main>
            </div>
        </div>
    );
}

const navStyle: React.CSSProperties = {
    display: "flex",
    gap: "12px",
    alignItems: "center",
    padding: "12px",
    marginBottom: "8px",
    borderRadius: "8px",
    textDecoration: "none",
    color: "#cbd5e1",
    fontSize: "14px",
};