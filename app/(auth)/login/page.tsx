import { LoginForm } from "@/components/login-form";

export default function LoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-100 px-4">
      <div className="w-full max-w-sm rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-slate-950">DoorDesk</h1>
          <p className="mt-1 text-sm text-slate-500">Sign in with your company account.</p>
        </div>
        <LoginForm />
      </div>
    </main>
  );
}
