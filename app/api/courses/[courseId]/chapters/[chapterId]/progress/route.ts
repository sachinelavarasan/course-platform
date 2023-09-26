import { db } from "@/lib/db";
import { isTeacher } from "@/lib/teacher";
import { auth } from "@clerk/nextjs";
import { NextResponse } from "next/server";

export async function PUT(
  req: Request,
  {
    params,
  }: {
    params: {
      courseId: string;
      chapterId: string;
    };
  }
) {
  try {
    const { userId } = auth();
    const { chapterId } = params;
    const { isCompleted } = await req.json();

    if (!userId || !isTeacher(userId))
      return new NextResponse("Unauthorized", {
        status: 401,
      });

    const userProgress =
      await db.userProgress.upsert({
        where: {
          userId_chapterId: {
            chapterId,
            userId,
          },
        },
        update: {
          isCompleted,
        },
        create: {
          userId,
          chapterId,
          isCompleted,
        },
      });

    return NextResponse.json(userProgress);
  } catch (error) {
    console.log("[CHAPTER_PROGRESS]", error);
    return new NextResponse(
      "Internal Server error",
      { status: 500 }
    );
  }
}
