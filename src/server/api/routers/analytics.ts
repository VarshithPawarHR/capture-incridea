import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { z } from "zod";
import { db } from "~/server/db";
export const analyticsRouter = createTRPCRouter({
  logVisit: publicProcedure
    .input(
      z.object({
        session_user: z.string(),
        uniqueId: z.string(),
        routePath: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      const { session_user, uniqueId, routePath } = input;
      const currentDateAndTime = new Date();
      await db.webAnalytics.create({
        data: {
          session_user: session_user,
          uniqueId: uniqueId,
          routePath: routePath,
          isChecked: "no",
          timer: 0,
          startPing: currentDateAndTime,
          lastPing: currentDateAndTime,
        },
      });
    }),

  // Update an existing visit
  updateVisit: publicProcedure
    .input(
      z.object({
        uniqueId: z.string(),
        timer: z.number(),
      })
    )
    .mutation(async ({ input }) => {
      const { uniqueId, timer } = input;
      const currentDateAndTime = new Date();
      await db.webAnalytics.updateMany({
        where: { uniqueId },
        data: {
          timer,
          isChecked: "yes",
          lastPing: currentDateAndTime,  
        },
      });
    }),

  // Retrieve analytics data
  getAnalytics: publicProcedure.query(async ({ ctx }) => {
      const data = await ctx.db.webAnalytics.findMany();
      return data;
  }),

  // Procedure to update entries with null timer values
  updateNullEntries: publicProcedure
    .input(
      z.object({
        session_user: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      const { session_user } = input;
      await db.webAnalytics.updateMany({
        where: {
          session_user: session_user,
          isChecked: "no",
        },
        data: {
          isChecked:"yes",
        },
      });
    }),
    syncTimerVisit: publicProcedure
    .input(
      z.object({
        uniqueId: z.string(),
        timer: z.number(),
      })
    )
    .mutation(async ({ input }) => {
      const { uniqueId, timer } = input;
      const currentDateAndTime = new Date();
      await db.webAnalytics.updateMany({
        where: { uniqueId },
        data: {
          timer,
          lastPing: currentDateAndTime,
        },
      });
    }),
    
});
