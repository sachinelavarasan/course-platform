import { db } from "@/lib/db";
import { isTeacher } from "@/lib/teacher";
import { auth } from "@clerk/nextjs";
import { NextResponse } from "next/server";

export async function POST(
  req: Request,
  { params }: { params: { courseId: string } }
) {
  try {
    const { userId } = auth();
    const { courseId } = params;
    const { title } = await req.json();

    if (!userId || !isTeacher(userId))
      return new NextResponse("Unauthorized", {
        status: 401,
      });

    const courseOwner =
      await db.course.findUnique({
        where: {
          id: courseId,
          userId,
        },
      });

    if (!courseOwner) {
      return new NextResponse("Unauthorized", {
        status: 401,
      });
    }

    const lastChapter =
      await db.chapter.findFirst({
        where: {
          courseId,
        },
        orderBy: {
          position: "desc",
        },
      });

    const newPosition = lastChapter
      ? lastChapter.position + 1
      : 1;

    const newChapter = await db.chapter.create({
      data: {
        title: title,
        position: newPosition,
        courseId,
      },
    });

    return NextResponse.json(newChapter);
  } catch (error) {
    console.log("[CHAPTERS]", error);
    return new NextResponse(
      "Internal Server error",
      { status: 500 }
    );
  }
}
