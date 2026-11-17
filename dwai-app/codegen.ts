import type { CodegenConfig } from "@graphql-codegen/cli";

const config: CodegenConfig = {
  overwrite: true,
  schema: "http://localhost:5000/graphql",
  documents: "{app,components,fragments,lib}/**/*.{ts,tsx}",
  generates: {
    "gql/": {
      preset: "client",
      presetConfig: {
        fragmentMasking: {
          // Default name is `useFragment`, which eslint-plugin-react-hooks
          // treats as a hook (it's not one) purely because of the name.
          unmaskFunctionName: "unmaskFragment",
        },
      },
      config: {
        // RFC 3339 timestamps, as the API sends them.
        scalars: { Time: "string" },
      },
      plugins: [],
    },
  },
};

export default config;
