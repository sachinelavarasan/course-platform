import Mux from "@mux/mux-node";
import { db } from "@/lib/db";
import { auth } from "@clerk/nextjs";
import { NextResponse } from "next/server";
import { isTeacher } from "@/lib/teacher";

const { Video } = new Mux(
  process.env.MUX_TOKEN_ID!,
  process.env.MUX_TOKEN_SECRET!
);

export async function PATCH(
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
    const { courseId, chapterId } = params;
    const { isPublished, ...values } =
      await req.json();

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
    if (!courseOwner)
      return new NextResponse("Unauthorized", {
        status: 401,
      });

    const chapter = await db.chapter.update({
      where: {
        id: chapterId,
        courseId,
      },
      data: {
        ...values,
      },
    });

    if (values.videoUrl) {
      const existingMuxData =
        await db.muxData.findFirst({
          where: {
            chapterId: chapterId,
          },
        });

      if (existingMuxData) {
        await Video.Assets.del(
          existingMuxData.assetId
        );
        await db.muxData.delete({
          where: {
            id: existingMuxData.id,
          },
        });
      }

      const asset = await Video.Assets.create({
        input: values.videoUrl,
        playback_policy: "public",
        test: false,
      });

      await db.muxData.create({
        data: {
          chapterId: chapterId,
          assetId: asset.id,
          playbackId: asset.playback_ids?.[0]?.id,
        },
      });
    }

    return NextResponse.json(chapter);
  } catch (error) {
    console.log("[CHAPTER_ID]", error);
    return new NextResponse(
      "Internal Server error",
      { status: 500 }
    );
  }
}

export async function DELETE(
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
    const { courseId, chapterId } = params;
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
    if (!courseOwner)
      return new NextResponse("Unauthorized", {
        status: 401,
      });

    const chapter = await db.chapter.findUnique({
      where: {
        id: chapterId,
        courseId,
      },
    });
    if (!chapter) {
      return new NextResponse("Not found", {
        status: 404,
      });
    }

    if (chapter.videoUrl) {
      const existingMuxData =
        await db.muxData.findFirst({
          where: {
            chapterId: chapterId,
          },
        });
      if (existingMuxData) {
        await Video.Assets.del(
          existingMuxData.assetId
        );
        await db.muxData.delete({
          where: {
            id: existingMuxData.id,
          },
        });
      }
    }

    await db.chapter.delete({
      where: {
        id: chapterId,
      },
    });

    const publishedChapter =
      await db.chapter.findMany({
        where: {
          courseId: courseId,
          isPublished: true,
        },
      });

    if (publishedChapter.length) {
      await db.course.update({
        where: {
          id: chapterId,
        },
        data: {
          isPublished: false,
        },
      });
    }

    return new NextResponse("Success", {
      status: 200,
    });
  } catch (error) {
    console.log("[CHAPTER_ID_DELETE]", error);
    return new NextResponse(
      "Internal Server error",
      { status: 500 }
    );
  }
}
