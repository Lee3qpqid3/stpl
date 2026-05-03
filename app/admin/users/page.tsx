"use client";

import { useEffect, useState } from "react";

type AdminUser = {
  id: string;
  email: string;
  name: string;
  role: string;
  accountStatus: string;
  proExpiresAt: string | null;
  isPro: boolean;
  createdAt: string;
};

export default function AdminUsersPage() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");

  async function loadUsers() {
    const response = await fetch("/api/admin/list-users");
    const result = await response.json();

    if (!response.ok) {
      setMessage(result.error ?? "사용자 목록 불러오기 실패");
      return;
    }

    setUsers(result.users);
  }

  useEffect(() => {
    loadUsers();
  }, []);

  async function createUser() {
    setMessage("생성 중...");

    const response = await fetch("/api/admin/create-user", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        email,
        password,
        name
      })
    });

    const result = await response.json();

    if (!response.ok) {
      setMessage(result.error ?? "생성 실패");
      return;
    }

    setMessage("계정 생성 완료");
    setEmail("");
    setPassword("");
    setName("");
    await loadUsers();
  }

  async function updateUserStatus(userId: string, accountStatus: string) {
    const response = await fetch("/api/admin/update-user-status", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        userId,
        accountStatus
      })
    });

    const result = await response.json();

    if (!response.ok) {
      setMessage(result.error ?? "상태 변경 실패");
      return;
    }

    setMessage("계정 상태를 변경했습니다.");
    await loadUsers();
  }

  async function deleteUser(userId: string) {
    const ok = window.confirm(
      "정말 이 계정을 삭제할까요? 이 작업은 되돌리기 어렵습니다."
    );

    if (!ok) return;

    const response = await fetch("/api/admin/delete-user", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        userId
      })
    });

    const result = await response.json();

    if (!response.ok) {
      setMessage(result.error ?? "삭제 실패");
      return;
    }

    setMessage("계정을 삭제했습니다.");
    await loadUsers();
  }

  return (
    <div className="rounded-3xl bg-white p-6 shadow">
      <h1 className="text-2xl font-bold">사용자 관리</h1>
      <p className="mt-2 text-sm text-slate-500">
        웹에서는 회원가입을 제공하지 않으며, 관리자가 이 화면에서 계정을 생성하고 관리합니다.
      </p>

      <div className="mt-6 rounded-2xl border p-4">
        <h2 className="font-semibold">새 계정 생성</h2>

        <div className="mt-4 grid gap-3 md:max-w-xl">
          <label className="text-sm font-medium">사용자 이름</label>
          <input
            className="rounded-xl border p-3"
            placeholder="예: 테스트사용자"
            value={name}
            onChange={(event) => setName(event.target.value)}
          />

          <label className="text-sm font-medium">이메일</label>
          <input
            className="rounded-xl border p-3"
            placeholder="user@example.com"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />

          <label className="text-sm font-medium">초기 비밀번호</label>
          <input
            className="rounded-xl border p-3"
            placeholder="초기 비밀번호"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />

          <button
            onClick={createUser}
            className="rounded-xl bg-slate-950 px-4 py-3 text-white"
          >
            계정 생성
          </button>
        </div>
      </div>

      {message && <p className="mt-4 text-sm text-slate-600">{message}</p>}

      <div className="mt-6 rounded-2xl border p-4">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold">사용자 목록</h2>
          <button
            onClick={loadUsers}
            className="rounded-xl border px-3 py-2 text-sm hover:bg-slate-50"
          >
            새로고침
          </button>
        </div>

        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[900px] border-collapse text-sm">
            <thead>
              <tr className="border-b bg-slate-50 text-left">
                <th className="p-3">이름</th>
                <th className="p-3">이메일</th>
                <th className="p-3">권한</th>
                <th className="p-3">상태</th>
                <th className="p-3">등급</th>
                <th className="p-3">Pro 만료일</th>
                <th className="p-3">관리</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id} className="border-b">
                  <td className="p-3">{user.name}</td>
                  <td className="p-3">{user.email}</td>
                  <td className="p-3">{user.role}</td>
                  <td className="p-3">{user.accountStatus}</td>
                  <td className="p-3">{user.isPro ? "Pro" : "일반"}</td>
                  <td className="p-3">
                    {user.proExpiresAt
                      ? new Date(user.proExpiresAt).toLocaleString("ko-KR")
                      : "-"}
                  </td>
                  <td className="flex gap-2 p-3">
                    {user.accountStatus === "active" ? (
                      <button
                        onClick={() => updateUserStatus(user.id, "disabled")}
                        className="rounded-lg border px-3 py-1 text-xs hover:bg-slate-50"
                      >
                        비활성화
                      </button>
                    ) : (
                      <button
                        onClick={() => updateUserStatus(user.id, "active")}
                        className="rounded-lg border px-3 py-1 text-xs hover:bg-slate-50"
                      >
                        재활성화
                      </button>
                    )}

                    <button
                      onClick={() => deleteUser(user.id)}
                      className="rounded-lg border border-red-200 px-3 py-1 text-xs text-red-600 hover:bg-red-50"
                    >
                      삭제
                    </button>
                  </td>
                </tr>
              ))}

              {users.length === 0 && (
                <tr>
                  <td className="p-3 text-slate-500" colSpan={7}>
                    사용자 목록이 없습니다.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
