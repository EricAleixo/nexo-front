import { authService } from "@/src/services/auth.service";
import { Header } from "./components/Header";
import { Hero } from "./components/Hero";
import { PublicRooms } from "./components/PublicRooms";

export default async function Home() {
  const user = await authService.getMe();

  return (
    <div className="min-h-screen bg-slate-50">
      <Header user={user} />
      <main className="mx-auto px-11">
        <Hero />
        <PublicRooms />
      </main>
    </div>
  );
}
