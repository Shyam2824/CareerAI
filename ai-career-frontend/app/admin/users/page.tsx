"use client";

import { useState } from "react";
import {
  Search,
  Mail,
  Trash2,
  Ban,
  CheckCircle,
} from "lucide-react";

type User = {
  id: number;
  name: string;
  email: string;
  plan: string;
  status: string;
  joined: string;
};

export default function UsersPage() {
  const [search, setSearch] = useState("");

  const [users, setUsers] = useState<User[]>([
    {
      id: 1,
      name: "Rahul Kumar",
      email: "rahul@gmail.com",
      plan: "Premium",
      status: "Active",
      joined: "Sep 02, 2026",
    },
    {
      id: 2,
      name: "Priya Sharma",
      email: "priya@gmail.com",
      plan: "Free",
      status: "Active",
      joined: "Sep 01, 2026",
    },
    {
      id: 3,
      name: "Amit Singh",
      email: "amit@gmail.com",
      plan: "Premium",
      status: "Active",
      joined: "Aug 30, 2026",
    },
  ]);

  const filteredUsers = users.filter((user) => {
    return (
      user.name.toLowerCase().includes(search.toLowerCase()) ||
      user.email.toLowerCase().includes(search.toLowerCase())
    );
  });

  const toggleStatus = (id: number) => {
    setUsers((currentUsers) =>
      currentUsers.map((user) =>
        user.id === id
          ? {
              ...user,
              status:
                user.status === "Active"
                  ? "Blocked"
                  : "Active",
            }
          : user
      )
    );
  };

  const deleteUser = (id: number) => {
    setUsers((currentUsers) =>
      currentUsers.filter((user) => user.id !== id)
    );
  };

  return (
    <div>
      <h1 className="text-3xl font-bold text-slate-900">
        Users Management
      </h1>

      <p className="mt-2 text-slate-500">
        Manage CareerAI users.
      </p>

      <div className="mt-8 rounded-2xl bg-white p-6 shadow-sm">
        <div className="relative max-w-md">
          <Search
            size={18}
            className="absolute left-3 top-3 text-slate-400"
          />

          <input
            type="text"
            placeholder="Search users..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl border border-slate-300 p-3 pl-10 outline-none focus:border-purple-500"
          />
        </div>

        <div className="mt-6 overflow-x-auto">
          <table className="w-full min-w-175">
            <thead>
              <tr className="border-b text-left text-sm text-slate-500">
                <th className="pb-4">User</th>
                <th className="pb-4">Plan</th>
                <th className="pb-4">Status</th>
                <th className="pb-4">Joined</th>
                <th className="pb-4">Actions</th>
              </tr>
            </thead>

            <tbody>
              {filteredUsers.map((user) => (
                <tr
                  key={user.id}
                  className="border-b border-slate-100"
                >
                  <td className="py-4">
                    <p className="font-semibold text-slate-900">
                      {user.name}
                    </p>

                    <p className="flex items-center gap-1 text-sm text-slate-500">
                      <Mail size={13} />
                      {user.email}
                    </p>
                  </td>

                  <td>{user.plan}</td>

                  <td>
                    <span
                      className={
                        user.status === "Active"
                          ? "font-medium text-green-600"
                          : "font-medium text-red-600"
                      }
                    >
                      {user.status}
                    </span>
                  </td>

                  <td>{user.joined}</td>

                  <td>
                    <div className="flex gap-2">
                      <button
                        onClick={() => toggleStatus(user.id)}
                        className="rounded-lg p-2 text-orange-500 hover:bg-orange-50"
                      >
                        {user.status === "Active" ? (
                          <Ban size={18} />
                        ) : (
                          <CheckCircle size={18} />
                        )}
                      </button>

                      <button
                        onClick={() => deleteUser(user.id)}
                        className="rounded-lg p-2 text-red-500 hover:bg-red-50"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}