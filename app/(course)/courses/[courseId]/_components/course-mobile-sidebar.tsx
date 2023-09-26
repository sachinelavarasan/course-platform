import { auth } from "@clerk/nextjs";
import {
  Chapter,
  Course,
  UserProgress,
} from "@prisma/client";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { CourseSidebar } from "./course-sidebar";
import { Menu } from "lucide-react";

interface CourseMobileSidebarProps {
  course: Course & {
    chapters: (Chapter & {
      userProgress: UserProgress[] | null;
    })[];
  };
  progressCount: number;
}

export const CourseMobileSidebar = async ({
  course,
  progressCount,
}: CourseMobileSidebarProps) => {
  const { userId } = auth();

  if (!userId) {
    return redirect("/");
  }

  return (
    <Sheet>
      <SheetTrigger
        className="md:hidden pr-4 hover:opacity-75 transition"
        aria-controls="radix-:R1mcq:"
      >
        <Menu />
      </SheetTrigger>
      <SheetContent
        side="left"
        className="p-0 bg-white w-72"
      >
        <CourseSidebar
          course={course}
          progressCount={progressCount}
        />
      </SheetContent>
    </Sheet>
  );
};
