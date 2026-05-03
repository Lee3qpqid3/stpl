"use client";

import { useEffect, useMemo, useState } from "react";
import AppNav from "@/components/AppNav";

type Category = {
  id: string;
  name: string;
  color: string;
};

type Subject = {
  id: string;
  name: string;
  category_id: string;
  categories?: {
    name: string;
    color: string;
  };
};

type WorkTask = {
  id: string;
  subject_id: string;
  type: "work" | "task";
  title: string;
  aliases: string[];
  classification: string | null;
  estimated_seconds: number | null;
  total_duration_seconds: number;
  progress_formula: string | null;
  deadline: string | null;
  subjects?: {
    id: string;
    name: string;
    categories?: {
      id: string;
      name: string;
      color: string;
    };
  };
};

const pastelColors = [
  "#A7C7E7",
  "#B7E4C7",
  "#FFD6A5",
  "#FFADAD",
  "#CDB4DB",
  "#FDFFB6",
  "#CAFFBF",
  "#9BF6FF"
];

function formatSeconds(seconds: number | null | undefined) {
  if (!seconds) return "-";

  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;

  if (h > 0) return `${h}시간 ${m}분 ${s}초`;
  if (m > 0) return `${m}분 ${s}초`;
  return `${s}초`;
}

export default function WeeklyPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [workTasks, setWorkTasks] = useState<WorkTask[]>([]);
  const [message, setMessage] = useState("");

  const [categoryName, setCategoryName] = useState("");
  const [categoryColor, setCategoryColor] = useState("#A7C7E7");

  const [subjectName, setSubjectName] = useState("");
  const [subjectCategoryId, setSubjectCategoryId] = useState("");

  const [workTaskSubjectId, setWorkTaskSubjectId] = useState("");
  const [workTaskType, setWorkTaskType] = useState<"work" | "task">("task");
  const [workTaskTitle, setWorkTaskTitle] = useState("");
  const [aliasesText, setAliasesText] = useState("");
  const [classification, setClassification] = useState("");
  const [estimatedHours, setEstimatedHours] = useState("");
  const [estimatedMinutes, setEstimatedMinutes] = useState("");
  const [estimatedSeconds, setEstimatedSeconds] = useState("");
  const [progressFormula, setProgressFormula] = useState("");
  const [deadline, setDeadline] = useState("");

  async function loadAll() {
    const [categoriesResponse, subjectsResponse, workTasksResponse] =
      await Promise.all([
        fetch("/api/categories", { cache: "no-store" }),
        fetch("/api/subjects", { cache: "no-store" }),
        fetch("/api/work-tasks", { cache: "no-store" })
      ]);

    const categoriesResult = await categoriesResponse.json();
    const subjectsResult = await subjectsResponse.json();
    const workTasksResult = await workTasksResponse.json();

    if (!categoriesResponse.ok) {
      setMessage(categoriesResult.error ?? "카테고리 불러오기 실패");
      return;
    }

    if (!subjectsResponse.ok) {
      setMessage(subjectsResult.error ?? "서브젝트 불러오기 실패");
      return;
    }

    if (!workTasksResponse.ok) {
      setMessage(workTasksResult.error ?? "워크/테스크 불러오기 실패");
      return;
    }

    setCategories(categoriesResult.categories ?? []);
    setSubjects(subjectsResult.subjects ?? []);
    setWorkTasks(workTasksResult.workTasks ?? []);
  }

  useEffect(() => {
    loadAll();
  }, []);

  async function createCategory() {
    setMessage("카테고리 생성 중...");

    const response = await fetch("/api/categories", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        name: categoryName,
        color: categoryColor
      })
    });

    const result = await response.json();

    if (!response.ok) {
      setMessage(result.error ?? "카테고리 생성 실패");
      return;
    }

    setCategoryName("");
    setCategoryColor("#A7C7E7");
    setMessage("카테고리를 생성했습니다.");
    await loadAll();
  }

  async function createSubject() {
    setMessage("서브젝트 생성 중...");

    const response = await fetch("/api/subjects", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        name: subjectName,
        categoryId: subjectCategoryId
      })
    });

    const result = await response.json();

    if (!response.ok) {
      setMessage(result.error ?? "서브젝트 생성 실패");
      return;
    }

    setSubjectName("");
    setSubjectCategoryId("");
    setMessage("서브젝트를 생성했습니다.");
    await loadAll();
  }

  async function createWorkTask() {
    setMessage("워크/테스크 생성 중...");

    const totalEstimatedSeconds =
      Number(estimatedHours || 0) * 3600 +
      Number(estimatedMinutes || 0) * 60 +
      Number(estimatedSeconds || 0);

    const response = await fetch("/api/work-tasks", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        subjectId: workTaskSubjectId,
        type: workTaskType,
        title: workTaskTitle,
        aliasesText,
        classification,
        estimatedSeconds:
          totalEstimatedSeconds > 0 ? totalEstimatedSeconds : null,
        progressFormula,
        deadline
      })
    });

    const result = await response.json();

    if (!response.ok) {
      setMessage(result.error ?? "워크/테스크 생성 실패");
      return;
    }

    setWorkTaskSubjectId("");
    setWorkTaskType("task");
    setWorkTaskTitle("");
    setAliasesText("");
    setClassification("");
    setEstimatedHours("");
    setEstimatedMinutes("");
    setEstimatedSeconds("");
    setProgressFormula("");
    setDeadline("");

    setMessage("워크/테스크를 생성했습니다.");
    await loadAll();
  }

  const subjectsByCategory = useMemo(() => {
    return categories.map((category) => ({
      category,
      subjects: subjects.filter((subject) => subject.category_id === category.id)
    }));
  }, [categories, subjects]);

  return (
    <main className="flex min-h-screen">
      <AppNav />

      <section className="flex-1 p-6">
        <div className="rounded-3xl bg-white p-6 shadow">
          <h1 className="text-2xl font-bold">주간 계획</h1>
          <p className="mt-2 text-slate-500">
            카테고리, 서브젝트, 워크/테스크를 생성하고 구조를 확인합니다.
          </p>

          {message && (
            <div className="mt-4 rounded-2xl bg-slate-100 p-3 text-sm text-slate-700">
              {message}
            </div>
          )}

          <div className="mt-6 grid gap-4 xl:grid-cols-3">
            <div className="rounded-2xl border p-4">
              <h2 className="font-semibold">카테고리 생성</h2>
              <p className="mt-1 text-sm text-slate-500">
                예: 공부, 생활, 운동
              </p>

              <input
                className="mt-4 w-full rounded-xl border p-3"
                placeholder="카테고리 이름"
                value={categoryName}
                onChange={(event) => setCategoryName(event.target.value)}
              />

              <div className="mt-3 flex flex-wrap gap-2">
                {pastelColors.map((color) => (
                  <button
                    key={color}
                    onClick={() => setCategoryColor(color)}
                    className={
                      categoryColor === color
                        ? "h-8 w-8 rounded-full border-2 border-slate-950"
                        : "h-8 w-8 rounded-full border"
                    }
                    style={{ backgroundColor: color }}
                    aria-label={color}
                  />
                ))}
              </div>

              <input
                className="mt-3 w-full rounded-xl border p-3 font-mono"
                value={categoryColor}
                onChange={(event) => setCategoryColor(event.target.value)}
                placeholder="#A7C7E7"
              />

              <button
                onClick={createCategory}
                className="mt-4 rounded-xl bg-slate-950 px-4 py-2 text-white"
              >
                카테고리 추가
              </button>
            </div>

            <div className="rounded-2xl border p-4">
              <h2 className="font-semibold">서브젝트 생성</h2>
              <p className="mt-1 text-sm text-slate-500">
                예: 수학, 영어, 러닝
              </p>

              <select
                className="mt-4 w-full rounded-xl border p-3"
                value={subjectCategoryId}
                onChange={(event) => setSubjectCategoryId(event.target.value)}
              >
                <option value="">카테고리 선택</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>

              <input
                className="mt-3 w-full rounded-xl border p-3"
                placeholder="서브젝트 이름"
                value={subjectName}
                onChange={(event) => setSubjectName(event.target.value)}
              />

              <button
                onClick={createSubject}
                className="mt-4 rounded-xl bg-slate-950 px-4 py-2 text-white"
              >
                서브젝트 추가
              </button>
            </div>

            <div className="rounded-2xl border p-4">
              <h2 className="font-semibold">워크/테스크 생성</h2>
              <p className="mt-1 text-sm text-slate-500">
                테스크는 반복 활동, 워크는 1회성 활동입니다.
              </p>

              <select
                className="mt-4 w-full rounded-xl border p-3"
                value={workTaskSubjectId}
                onChange={(event) => setWorkTaskSubjectId(event.target.value)}
              >
                <option value="">서브젝트 선택</option>
                {subjects.map((subject) => (
                  <option key={subject.id} value={subject.id}>
                    {subject.categories?.name ?? "카테고리 없음"} &gt;{" "}
                    {subject.name}
                  </option>
                ))}
              </select>

              <select
                className="mt-3 w-full rounded-xl border p-3"
                value={workTaskType}
                onChange={(event) =>
                  setWorkTaskType(event.target.value as "work" | "task")
                }
              >
                <option value="task">테스크 - 주기적 활동</option>
                <option value="work">워크 - 1회성/비정기 활동</option>
              </select>

              <input
                className="mt-3 w-full rounded-xl border p-3"
                placeholder="워크/테스크 이름"
                value={workTaskTitle}
                onChange={(event) => setWorkTaskTitle(event.target.value)}
              />

              <input
                className="mt-3 w-full rounded-xl border p-3"
                placeholder="별칭, 쉼표로 구분 예: 인강, 강의, 수학T"
                value={aliasesText}
                onChange={(event) => setAliasesText(event.target.value)}
              />

              <input
                className="mt-3 w-full rounded-xl border p-3"
                placeholder="분류 예: 인강, 문제풀이, 보고서"
                value={classification}
                onChange={(event) => setClassification(event.target.value)}
              />

              <div className="mt-3 grid grid-cols-3 gap-2">
                <input
                  className="rounded-xl border p-3"
                  type="number"
                  min={0}
                  placeholder="시"
                  value={estimatedHours}
                  onChange={(event) => setEstimatedHours(event.target.value)}
                />
                <input
                  className="rounded-xl border p-3"
                  type="number"
                  min={0}
                  placeholder="분"
                  value={estimatedMinutes}
                  onChange={(event) => setEstimatedMinutes(event.target.value)}
                />
                <input
                  className="rounded-xl border p-3"
                  type="number"
                  min={0}
                  placeholder="초"
                  value={estimatedSeconds}
                  onChange={(event) => setEstimatedSeconds(event.target.value)}
                />
              </div>

              <input
                className="mt-3 w-full rounded-xl border p-3"
                placeholder="진행도 수식 예: 변수1 / 변수2 * 100"
                value={progressFormula}
                onChange={(event) => setProgressFormula(event.target.value)}
              />

              <label className="mt-3 block text-sm text-slate-500">
                마감일
              </label>
              <input
                className="mt-1 w-full rounded-xl border p-3"
                type="datetime-local"
                value={deadline}
                onChange={(event) => setDeadline(event.target.value)}
              />

              <button
                onClick={createWorkTask}
                className="mt-4 rounded-xl bg-slate-950 px-4 py-2 text-white"
              >
                워크/테스크 추가
              </button>
            </div>
          </div>

          <div className="mt-8 rounded-2xl border p-4">
            <h2 className="font-semibold">현재 구조</h2>

            {subjectsByCategory.length === 0 && (
              <p className="mt-3 text-sm text-slate-500">
                아직 생성된 카테고리가 없습니다.
              </p>
            )}

            <div className="mt-4 grid gap-4 lg:grid-cols-2">
              {subjectsByCategory.map(({ category, subjects }) => (
                <div
                  key={category.id}
                  className="rounded-2xl border p-4"
                  style={{ borderColor: category.color }}
                >
                  <div className="flex items-center gap-2">
                    <div
                      className="h-4 w-4 rounded-full"
                      style={{ backgroundColor: category.color }}
                    />
                    <h3 className="font-semibold">{category.name}</h3>
                  </div>

                  {subjects.length === 0 && (
                    <p className="mt-3 text-sm text-slate-500">
                      아직 서브젝트가 없습니다.
                    </p>
                  )}

                  <div className="mt-3 space-y-3">
                    {subjects.map((subject) => {
                      const items = workTasks.filter(
                        (item) => item.subject_id === subject.id
                      );

                      return (
                        <div key={subject.id} className="rounded-xl bg-slate-50 p-3">
                          <h4 className="font-medium">{subject.name}</h4>

                          {items.length === 0 && (
                            <p className="mt-2 text-sm text-slate-500">
                              아직 워크/테스크가 없습니다.
                            </p>
                          )}

                          <div className="mt-2 space-y-2">
                            {items.map((item) => (
                              <div
                                key={item.id}
                                className="rounded-xl border bg-white p-3 text-sm"
                              >
                                <div className="flex flex-wrap items-center gap-2">
                                  <span
                                    className={
                                      item.type === "task"
                                        ? "rounded-full bg-blue-50 px-2 py-1 text-xs text-blue-700"
                                        : "rounded-full bg-purple-50 px-2 py-1 text-xs text-purple-700"
                                    }
                                  >
                                    {item.type === "task" ? "테스크" : "워크"}
                                  </span>
                                  <strong>{item.title}</strong>
                                </div>

                                <div className="mt-2 grid gap-1 text-slate-600">
                                  <p>
                                    분류: {item.classification ?? "-"}
                                  </p>
                                  <p>
                                    별칭:{" "}
                                    {item.aliases && item.aliases.length > 0
                                      ? item.aliases.join(", ")
                                      : "-"}
                                  </p>
                                  <p>
                                    예상 소요 시간:{" "}
                                    {formatSeconds(item.estimated_seconds)}
                                  </p>
                                  <p>
                                    누적 소요 시간:{" "}
                                    {formatSeconds(item.total_duration_seconds)}
                                  </p>
                                  <p>
                                    진행도 수식: {item.progress_formula ?? "-"}
                                  </p>
                                  <p>
                                    마감일:{" "}
                                    {item.deadline
                                      ? new Date(item.deadline).toLocaleString(
                                          "ko-KR"
                                        )
                                      : "-"}
                                  </p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
