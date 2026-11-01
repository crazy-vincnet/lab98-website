/** Shape returned by the sign-in / setup / reset Server Actions to their forms (useActionState). */
export type AuthFormState = {
  error?: string;
  fieldErrors?: Partial<Record<"email" | "password" | "confirm" | "code", string>>;
  /** Second step of setup / reset: the code form. Email is carried so the visitor does not retype it. */
  step?: "code";
  email?: string;
  notice?: string;
};

export const MIN_PASSWORD = 10;
