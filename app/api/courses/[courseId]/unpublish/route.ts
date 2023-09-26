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
    });
    if (!course)
      return new NextResponse("Not Found", {
        status: 404,
      });

    const unPublishedCourse =
      await db.course.update({
        where: {
          id: courseId,
          userId,
        },
        data: {
          isPublished: false,
        },
      });

    return NextResponse.json(unPublishedCourse);
  } catch (error) {
    console.log("[COURSE_UNPUBLISH]", error);
    return new NextResponse(
      "Internal Server error",
      { status: 500 }
    );
  }
}
