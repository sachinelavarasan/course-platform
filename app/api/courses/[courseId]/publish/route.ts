import { db } from "@/lib/db";
import { isTeacher } from "@/lib/teacher";
import { auth } from "@clerk/nextjs";
import { NextResponse } from "next/server";

export async function PATCH(
  req: Request,
  {
    params,
  }: {
    params: {
      courseId: string;
    };
  }
) {
  try {
    const { userId } = auth();
    const { courseId } = params;

    if (!userId || !isTeacher(userId))
      return new NextResponse("Unauthorized", {
        status: 401,
      });

    const course = await db.course.findUnique({
      where: {
        id: courseId,
        userId,
      },
      include: {
        chapters: {
          include: {
            muxData: true,
          },
        },
      },
    });
    if (!course)
      return new NextResponse("Not Found", {
        status: 404,
      });

    const hasPublishedChapter =
      course.chapters.some(
        (chapter) => chapter.isPublished
      );

    if (
      !course.title ||
      !hasPublishedChapter ||
      !course.description ||
      !course.imageUrl ||
      !course.categoryId
    ) {
      return new NextResponse(
        "Missing required fields",
        {
          status: 401,
        }
      );
    }

    const publishedCourse =
      await db.course.update({
        where: {
          id: courseId,
          userId,
        },
        data: {
          isPublished: true,
        },
      });

    return NextResponse.json(publishedCourse);
  } catch (error) {
    console.log("[COURSE_PUBLISH]", error);
    return new NextResponse(
      "Internal Server error",
      { status: 500 }
    );
  }
}