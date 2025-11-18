"use client";

import { useState, useEffect } from "react";
import { Edit2, Trash2 } from "lucide-react";
import styles from "./styles/clients.module.css";

export default function ClientsPage() {
  const [clients, setClients] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [editedClient, setEditedClient] = useState({});
  const [showForm, setShowForm] = useState(false);
  const [newClient, setNewClient] = useState({ name: "", contact: "", email: "" });

  useEffect(() => {
    fetchClients();
  }, []);

  async function fetchClients() {
    const res = await fetch("/api/clients");
    const data = await res.json();
    setClients(data);
  }

  async function handleSave(id) {
    await fetch(`/api/clients/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(editedClient),
    });
    setEditingId(null);
    fetchClients();
  }

  async function handleDelete(id) {
    if (confirm("Are you sure you want to delete this client?")) {
      await fetch(`/api/clients/${id}`, { method: "DELETE" });
      fetchClients();
    }
  }

  async function handleAddClient(e) {
    e.preventDefault();
    await fetch("/api/clients", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newClient),
    });
    setNewClient({ name: "", contact: "", email: "" });
    setShowForm(false);
    fetchClients();
  }

  return (
    <div className={styles.container}>
      <div className={styles.headerContainer}>
        <h1 className={styles.title}>Clients</h1>

        <button className={styles.addBtn} onClick={() => setShowForm(!showForm)}>
            {showForm ? "Close Form" : "Add Client"}
        </button>

        {showForm && (
            <form className={styles.addForm} onSubmit={handleAddClient}>
            <input
                type="text"
                placeholder="Name"
                value={newClient.name}
                onChange={(e) => setNewClient({ ...newClient, name: e.target.value })}
                className={styles.inputField}
                required
            />
            <input
                type="text"
                placeholder="Contact"
                value={newClient.contact}
                onChange={(e) => setNewClient({ ...newClient, contact: e.target.value })}
                className={styles.inputField}
            />
            <input
                type="email"
                placeholder="Email"
                value={newClient.email}
                onChange={(e) => setNewClient({ ...newClient, email: e.target.value })}
                className={styles.inputField}
            />
            <button type="submit" className={styles.saveBtn}>Save</button>
            </form>
        )}
      </div>

      <div className={styles.clientsGrid}>
        {clients.map((client) => (
          <div key={client.id} className={styles.clientCard}>
            {editingId === client.id ? (
              <div className={styles.editContainer}>
                {/* Cancel (X) button */}
                <button
                    className={styles.cancelEditBtn}
                    onClick={() => {
                    setEditingId(null);
                    setEditedClient({});
                    }}
                >
                    ×
                </button>

                <div className="client-edit-fields">
                    <input
                        type="text"
                        value={editedClient.name ?? client.name}
                        onChange={(e) =>
                        setEditedClient({ ...editedClient, name: e.target.value })
                        }
                        placeholder="Client Name"
                        className={styles.inputField}
                    />

                    <input
                        type="text"
                        value={editedClient.contact ?? client.contact}
                        onChange={(e) =>
                        setEditedClient({ ...editedClient, contact: e.target.value })
                        }
                        placeholder="Contact"
                        className={styles.inputField}
                    />

                    <input
                        type="email"
                        value={editedClient.email ?? client.email}
                        onChange={(e) =>
                        setEditedClient({ ...editedClient, email: e.target.value })
                        }
                        placeholder="Email"
                        className={styles.inputField}
                    />
                </div>

                <button
                    className={styles.saveBtn}
                    onClick={() => handleSave(client.id)}
                >
                    Save Changes
                </button>
                </div>

            ) : (
              <>
                <h2>{client.name}</h2>
                <hr className={styles.divider} />
                <div className={styles.clientInfoGrid}>
                    <div className={styles.label}>Contact:</div>
                    <div className={styles.value}>{client.contact || "N/A"}</div>

                    <div className={styles.label}>Email:</div>
                    <div className={styles.value}>{client.email || "N/A"}</div>
                </div>

                <div className={styles.actions}>
                    <button
                        className={styles.iconBtn}
                        onClick={() => {
                        setEditingId(client.id);
                        setEditedClient(client);
                        }}
                        title="Edit"
                    >
                        <Edit2 size={18} />
                    </button>
                    <button
                        className={styles.iconBtn}
                        onClick={() => handleDelete(client.id)}
                        title="Delete"
                    >
                        <Trash2 size={18} />
                    </button>
                </div>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
