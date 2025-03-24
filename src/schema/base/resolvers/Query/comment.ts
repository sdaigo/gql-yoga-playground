import type { QueryResolvers } from "./../../../types.generated";
export const comment: NonNullable<QueryResolvers["comment"]> = async (
  _parent,
  args,
  ctx,
) => {
  return ctx.prisma.comment.findUnique({
    where: {
      id: args.id,
    },
  });
};
