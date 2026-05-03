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
  isCurrentUser: boolean;
};

export default function AdminUsersPage() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");

  async function loadUsers() {
    const response = await fetch("/api/admin/list-users", {
      cache: "no-store"
    });
    const result = await response.json();

    if (!response.ok) {
      setMessage(result.error ?? "사용자 목록 불러오기 실패");
      return;
    }

    setUsers(result.users ?? []);
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

  async function editUserName(user: AdminUser) {
    const nextName = window.prompt("새 사용자 이름을 입력하세요.", user.name);

    if (!nextName) return;

    const response = await fetch("/api/admin/update-user", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        userId: user.id,
        name: nextName
      })
    });

    const result = await response.json();

    if (!response.ok) {
      setMessage(result.error ?? "이름 수정 실패");
      return;
    }

    setMessage("사용자 이름을 수정했습니다.");
    await loadUsers();
  }

  async function resetUserPassword(user: AdminUser) {
    const newPassword = window.prompt(
      `${user.name} 계정의 새 비밀번호를 입력하세요. 기존 비밀번호는 조회할 수 없습니다.`
    );

    if (!newPassword) return;

    const confirmPassword = window.prompt("새 비밀번호를 한 번 더 입력하세요.");

    if (newPassword !== confirmPassword) {
      setMessage("새 비밀번호와 확인 비밀번호가 일치하지 않습니다.");
      return;
    }

    const response = await fetch("/api/admin/update-user", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        userId: user.id,
        newPassword
      })
    });

    const result = await response.json();

    if (!response.ok) {
      setMessage(result.error ?? "비밀번호 재설정 실패");
      return;
    }

    setMessage("비밀번호를 재설정했습니다.");
  }

  return (
    <div className="w-full max-w-full overflow-hidden rounded-3xl bg-white p-4 shadow sm:p-6">
      <h1 className="text-2xl font-bold">사용자 관리</h1>
      <p className="mt-2 text-sm text-slate-500">
        비밀번호는 보안상 조회할 수 없으며, 관리자도 재설정만 할 수 있습니다.
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
        <div className="flex items-center justify-between gap-3">
          <h2 className="font-semibold">사용자 목록</h2>
          <button
            onClick={loadUsers}
            className="shrink-0 rounded-xl border px-3 py-2 text-sm hover:bg-slate-50"
          >
            새로고침
          </button>
        </div>

        <div className="mt-4 w-full max-w-full overflow-x-auto rounded-xl">
          <table className="min-w-[1100px] border-collapse text-sm">
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
                  <td className="p-3">
                    {user.name}
                    {user.isCurrentUser && (
                      <span className="ml-2 rounded-full bg-slate-100 px-2 py-1 text-xs text-slate-600">
                        현재 계정
                      </span>
                    )}
                  </td>
                  <td className="p-3">{user.email}</td>
                  <td className="p-3">{user.role}</td>
                  <td className="p-3">{user.accountStatus}</td>
                  <td className="p-3">{user.isPro ? "Pro" : "일반"}</td>
                  <td className="p-3">
                    {user.proExpiresAt
                      ? new Date(user.proExpiresAt).toLocaleString("ko-KR")
                      : "-"}
                  </td>
                  <td className="p-3">
                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={() => editUserName(user)}
                        className="rounded-lg border px-3 py-1 text-xs hover:bg-slate-50"
                      >
                        이름 수정
                      </button>

                      <button
                        onClick={() => resetUserPassword(user)}
                        className="rounded-lg border px-3 py-1 text-xs hover:bg-slate-50"
                      >
                        비밀번호 재설정
                      </button>

                      {user.isCurrentUser ? (
                        <span className="text-xs text-slate-400">
                          자기 계정 비활성화/삭제 불가
                        </span>
                      ) : (
                        <>
                          {user.accountStatus === "active" ? (
                            <button
                              onClick={() =>
                                updateUserStatus(user.id, "disabled")
                              }
                              className="rounded-lg border px-3 py-1 text-xs hover:bg-slate-50"
                            >
                              비활성화
                            </button>
                          ) : (
                            <button
                              onClick={() =>
                                updateUserStatus(user.id, "active")
                              }
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
                        </>
                      )}
                    </div>
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
