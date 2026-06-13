import { subjectService } from "@/src/services/subject.service";
import { HeroActions } from "./HeroActions";
import { HeroIllustration } from "./HeroIllustration";

export async function Hero() {

  const subjects = await subjectService.findAll();

  return (
    <section className="mt-6 rounded-3xl  bg-blue-100 px-6 py-10 sm:px-10 sm:py-12">
      <div className="flex flex-col items-center gap-10 lg:flex-row lg:items-center lg:justify-between">
        <div className="max-w-xl text-center lg:text-left">
          <h1 className="text-5xl font-bold leading-tight text-slate-800 w-100">
            Desafie, aprenda {" "}
            <span className="text-blue-600"><span className="text-teal-600">e</span> evolua juntos!</span>
          </h1>
          <p className="mt-4 leading-relaxed text-slate-600 text-xl">
            Crie uma sala de quiz ou entre em uma existente e teste seus
            conhecimentos.
          </p>
          <div className="mt-8 flex justify-center lg:justify-start">
            <HeroActions subjectsInitialData={subjects} />
          </div>
        </div>

        <HeroIllustration />
      </div>
    </section>
  );
}
