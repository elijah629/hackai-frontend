import { type JSX, memo } from "react";
import { cn } from "./utils";
import {
  InlineCitation,
  InlineCitationText,
  InlineCitationCard,
  InlineCitationCardTrigger,
  InlineCitationCardBody,
  InlineCitationCarousel,
  InlineCitationCarouselContent,
  InlineCitationCarouselItem,
  InlineCitationCarouselHeader,
  InlineCitationCarouselIndex,
  InlineCitationCarouselPrev,
  InlineCitationCarouselNext,
  InlineCitationSource,
  InlineCitationQuote,
} from "@/components/ai-elements/inline-citation";
import Link from "next/link";

type MarkdownPoint = { line?: number; column?: number };
type MarkdownPosition = { start?: MarkdownPoint; end?: MarkdownPoint };
type MarkdownNode = {
  position?: MarkdownPosition;
  properties?: { className?: string };
};

type WithNode<T> = T & {
  node?: MarkdownNode;
  children?: React.ReactNode;
  className?: string;
};

function sameNodePosition(prev?: MarkdownNode, next?: MarkdownNode): boolean {
  if (!(prev?.position || next?.position)) {
    return true;
  }
  if (!(prev?.position && next?.position)) {
    return false;
  }

  const prevStart = prev.position.start;
  const nextStart = next.position.start;
  const prevEnd = prev.position.end;
  const nextEnd = next.position.end;

  return (
    prevStart?.line === nextStart?.line &&
    prevStart?.column === nextStart?.column &&
    prevEnd?.line === nextEnd?.line &&
    prevEnd?.column === nextEnd?.column
  );
}

function sameClassAndNode(
  prev: { className?: string; node?: MarkdownNode },
  next: { className?: string; node?: MarkdownNode },
) {
  return (
    prev.className === next.className && sameNodePosition(prev.node, next.node)
  );
}
type AProps = WithNode<JSX.IntrinsicElements["a"]> & { href?: string };
export const MemoCitationA = memo<AProps>(
  ({ children, className, href, node, ...props }: AProps) => {
    const isIncomplete = href === "streamdown:incomplete-link";
    const isCitation = Boolean(
      href?.startsWith("citation:") ||
        children?.toString().startsWith("citation:"),
    );
    const citationLink = href?.replace("citation:", "");

    return isCitation ? (
      <InlineCitation>
        <InlineCitationCard>
          <Link href={citationLink!}>
            <InlineCitationCardTrigger sources={[citationLink!]} />
          </Link>
          <InlineCitationCardBody>
            <InlineCitationCarousel>
              <InlineCitationCarouselContent>
                <InlineCitationCarouselItem>
                  <InlineCitationSource
                    title={new URL(citationLink!).origin}
                    url={citationLink}
                  />
                </InlineCitationCarouselItem>
              </InlineCitationCarouselContent>
            </InlineCitationCarousel>
          </InlineCitationCardBody>
        </InlineCitationCard>
      </InlineCitation>
    ) : (
      <a
        className={cn(
          "wrap-anywhere font-medium text-primary underline",
          className,
        )}
        data-incomplete={isIncomplete}
        data-streamdown="link"
        href={href}
        rel="noreferrer"
        target="_blank"
        {...props}
      >
        {children}
      </a>
    );
  },
  (p, n) => sameClassAndNode(p, n) && p.href === n.href,
);
