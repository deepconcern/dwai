import { FC, PropsWithChildren } from "react";

import { requireUser } from "@/lib/session";

/** The create-character page is a client component, so its login check is here. */
export const CreateCharacterLayout: FC<PropsWithChildren> = async ({
  children,
}) => {
  await requireUser("/create-character");

  return children;
};

export default CreateCharacterLayout;
