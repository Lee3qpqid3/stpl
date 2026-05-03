export default function AdminBackupsPage() {
  return (
    <div className="rounded-3xl bg-white p-6 shadow">
      <h1 className="text-2xl font-bold">백업 관리</h1>
      <p className="mt-2 text-slate-500">
        사용자별 최대 15개 백업 목록과 복원 기능을 구현할 화면입니다.
      </p>

      <div className="mt-6 rounded-2xl border p-4 text-sm text-slate-600">
        현재는 기능 구현 대기 상태입니다. 다음 단계에서 사용자별 백업 목록, 삭제, 복원 기능을 연결합니다.
      </div>
    </div>
  );
}
