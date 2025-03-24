import type { MutationResolvers } from "./../../../types.generated";

export const postLink: NonNullable<MutationResolvers["postLink"]> = async (
  _parent,
  args,
  ctx,
) => {
  return ctx.prisma.link.create({
    data: {
      description: args.description,
      url: args.url,
    },
  });
};
