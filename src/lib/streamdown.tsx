import { BundledTheme } from "shiki";
import { harden } from "rehype-harden";
import {
  MermaidErrorComponentProps,
  MermaidOptions,
  StreamdownProps,
  defaultRehypePlugins,
} from "streamdown";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CodeBlock } from "@/components/ai-elements/code-block";
import { MemoCitationA } from "./streamdown-components";

const shikiTheme = ["catppuccin-latte", "catppuccin-mocha"] as [
  BundledTheme,
  BundledTheme,
];

const securityConfig = {
  allowedLinkPrefixes: ["*"],
  allowedImagePrefixes: ["*"],
  allowDataImages: false,
};

const rehypePlugins = [defaultRehypePlugins.katex, harden(securityConfig)];

const components: StreamdownProps["components"] = {
  a: MemoCitationA,
};

const mermaid: MermaidOptions = {
  config: {
    theme: "dark",
    themeVariables: {
      primaryColor: "#ec3750",
      primaryTextColor: "hsl(220deg, 23%, 95%)",
      primaryBorderColor: "hsl(225deg, 14%, 77%)",
      lineColor: "#ec3750",
      secondaryColor: "hsl(223deg, 16%, 83%)",
      tertiaryColor: "hsl(227deg, 12%, 71%)",
    },
  },
  errorComponent: ({ error, chart, retry }: MermaidErrorComponentProps) => (
    <Card className="border-0 -mt-2 min-w-md">
      <CardHeader>
        <CardTitle>Couldn't render diagram</CardTitle>
        <CardDescription>{error} </CardDescription>
      </CardHeader>
      <CardContent>
        <details>
          <summary>Source code</summary>
          <CodeBlock code={chart} language="mermaid" showLineNumbers />
        </details>
      </CardContent>
      <CardFooter>
        <Button onClick={retry}>Try Again</Button>
      </CardFooter>
    </Card>
  ),
};

export const streamdownConfig: StreamdownProps = {
  shikiTheme,
  rehypePlugins,
  mermaid,
  components,
};
