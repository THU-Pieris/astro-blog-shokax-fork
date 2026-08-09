declare module "nyx-player/style";
declare module "@waline/client/style";
declare module "@pagefind/component-ui";
declare module "@pagefind/component-ui/css";

interface ImportMetaEnv {
  readonly PUBLIC_SOURCE_REF?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
