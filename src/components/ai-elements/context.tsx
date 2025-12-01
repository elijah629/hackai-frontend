"use client";

import { Button } from "@/components/ui/button";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import type { MessageUsageMetadata } from "@/types/message";
import { type ComponentProps, createContext, useContext } from "react";

const PERCENT_MAX = 100;
const ICON_RADIUS = 10;
const ICON_VIEWBOX = 24;
const ICON_CENTER = 12;
const ICON_STROKE_WIDTH = 2;

type ContextSchema = {
  usage: MessageUsageMetadata;
  maxTokens?: number;
  usedTokens: number;
  totalCostUSD: number;
};

const ContextContext = createContext<ContextSchema | null>(null);

const useContextValue = () => {
  const context = useContext(ContextContext);

  if (!context) {
    throw new Error("Context components must be used within Context");
  }

  return context;
};

export type ContextProps = ComponentProps<typeof HoverCard> & {
  usage: MessageUsageMetadata;
  maxTokens?: number;
};

export const Context = ({ usage, maxTokens, ...props }: ContextProps) => {
  const usedTokens = (usage.promptTokens ?? 0) + (usage.completionTokens ?? 0);

  return (
    <ContextContext.Provider
      value={{
        usage,
        maxTokens,
        usedTokens,
        totalCostUSD: usage.cost ?? 0,
      }}
    >
      <HoverCard closeDelay={0} openDelay={0} {...props} />
    </ContextContext.Provider>
  );
};

const ContextIcon = () => {
  const { usedTokens, maxTokens } = useContextValue();

  if (!maxTokens || maxTokens <= 0) {
    return null;
  }

  const circumference = 2 * Math.PI * ICON_RADIUS;
  const usedPercent = Math.min(usedTokens / maxTokens, 1);
  const dashOffset = circumference * (1 - usedPercent);

  return (
    <svg
      aria-label="Model context usage"
      height="20"
      role="img"
      style={{ color: "currentcolor" }}
      viewBox={`0 0 ${ICON_VIEWBOX} ${ICON_VIEWBOX}`}
      width="20"
    >
      <circle
        cx={ICON_CENTER}
        cy={ICON_CENTER}
        fill="none"
        opacity="0.25"
        r={ICON_RADIUS}
        stroke="currentColor"
        strokeWidth={ICON_STROKE_WIDTH}
      />
      <circle
        cx={ICON_CENTER}
        cy={ICON_CENTER}
        fill="none"
        opacity="0.7"
        r={ICON_RADIUS}
        stroke="currentColor"
        strokeDasharray={`${circumference} ${circumference}`}
        strokeDashoffset={dashOffset}
        strokeLinecap="round"
        strokeWidth={ICON_STROKE_WIDTH}
        style={{ transformOrigin: "center", transform: "rotate(-90deg)" }}
      />
    </svg>
  );
};

export type ContextTriggerProps = ComponentProps<typeof Button>;

export const ContextTrigger = ({ children, ...props }: ContextTriggerProps) => {
  const { usedTokens, maxTokens, usage } = useContextValue();

  if (children) {
    return <HoverCardTrigger asChild>{children}</HoverCardTrigger>;
  }

  const hasMaxTokens = typeof maxTokens === "number" && maxTokens > 0;
  const usedPercent = hasMaxTokens ? usedTokens / maxTokens : undefined;

  const renderedPercent =
    hasMaxTokens && maxTokens
      ? new Intl.NumberFormat("en-US", {
          style: "percent",
          maximumFractionDigits: 1,
        }).format(usedPercent ?? 0)
      : null;

  const totalTokens =
    usage.totalTokens ??
    (usage.promptTokens ?? 0) + (usage.completionTokens ?? 0);

  const formattedTotalTokens = new Intl.NumberFormat("en-US", {
    notation: "compact",
  }).format(totalTokens);

  return (
    <HoverCardTrigger asChild>
      <Button type="button" variant="ghost" {...props}>
        {hasMaxTokens ? (
          <>
            <span className="font-medium text-muted-foreground">
              {renderedPercent}
            </span>
            <ContextIcon />
          </>
        ) : (
          <span className="font-medium text-muted-foreground">
            {formattedTotalTokens} tokens
          </span>
        )}
      </Button>
    </HoverCardTrigger>
  );
};

export type ContextContentProps = ComponentProps<typeof HoverCardContent>;

export const ContextContent = ({
  className,
  ...props
}: ContextContentProps) => (
  <HoverCardContent
    className={cn("min-w-60 divide-y overflow-hidden p-0", className)}
    {...props}
  />
);

export type ContextContentHeaderProps = ComponentProps<"div">;

export const ContextContentHeader = ({
  children,
  className,
  ...props
}: ContextContentHeaderProps) => {
  const { usedTokens, maxTokens, usage } = useContextValue();
  const hasMaxTokens = typeof maxTokens === "number" && maxTokens > 0;
  const usedPercent = hasMaxTokens ? usedTokens / maxTokens : 0;

  const displayPct =
    hasMaxTokens && maxTokens
      ? new Intl.NumberFormat("en-US", {
          style: "percent",
          maximumFractionDigits: 1,
        }).format(usedPercent)
      : null;

  const used = new Intl.NumberFormat("en-US", {
    notation: "compact",
  }).format(usedTokens);

  const totalTokens =
    usage.totalTokens ??
    (usage.promptTokens ?? 0) + (usage.completionTokens ?? 0);

  const total = new Intl.NumberFormat("en-US", {
    notation: "compact",
  }).format(hasMaxTokens ? maxTokens! : totalTokens);

  return (
    <div className={cn("w-full space-y-2 p-3", className)} {...props}>
      {children ?? (
        <>
          <div className="flex items-center justify-between gap-3 text-xs">
            {hasMaxTokens ? (
              <>
                <p>{displayPct}</p>
                <p className="font-mono text-muted-foreground">
                  {used} / {total}
                </p>
              </>
            ) : (
              <>
                <p className="text-muted-foreground">Total tokens</p>
                <p className="font-mono text-muted-foreground">{total}</p>
              </>
            )}
          </div>
          {hasMaxTokens ? (
            <div className="space-y-2">
              <Progress
                className="bg-muted"
                value={Math.min(usedPercent * PERCENT_MAX, PERCENT_MAX)}
              />
            </div>
          ) : null}
        </>
      )}
    </div>
  );
};

export type ContextContentBodyProps = ComponentProps<"div">;

export const ContextContentBody = ({
  children,
  className,
  ...props
}: ContextContentBodyProps) => (
  <div className={cn("w-full p-3", className)} {...props}>
    {children}
  </div>
);

export type ContextContentFooterProps = ComponentProps<"div">;

export const ContextContentFooter = ({
  children,
  className,
  ...props
}: ContextContentFooterProps) => {
  const { totalCostUSD } = useContextValue();
  const totalCostText = new Intl.NumberFormat("en-US", {
    style: "currency",
    maximumFractionDigits: 8,
    currency: "USD",
  }).format(totalCostUSD ?? 0);

  return (
    <div
      className={cn(
        "flex w-full items-center justify-between gap-3 bg-secondary p-3 text-xs",
        className,
      )}
      {...props}
    >
      {children ?? (
        <>
          <span className="text-muted-foreground">Total cost</span>
          <span>{totalCostText}</span>
        </>
      )}
    </div>
  );
};

export type ContextInputUsageProps = ComponentProps<"div">;

export const ContextInputUsage = ({
  className,
  children,
  ...props
}: ContextInputUsageProps) => {
  const { usage } = useContextValue();
  const inputTokens = usage?.promptTokens ?? 0;

  if (children) {
    return children;
  }

  if (!inputTokens) {
    return null;
  }

  return (
    <div
      className={cn("flex items-center justify-between text-xs", className)}
      {...props}
    >
      <span className="text-muted-foreground">Input</span>
      <TokensWithCost tokens={inputTokens} />
    </div>
  );
};

export type ContextOutputUsageProps = ComponentProps<"div">;

export const ContextOutputUsage = ({
  className,
  children,
  ...props
}: ContextOutputUsageProps) => {
  const { usage } = useContextValue();
  const outputTokens = usage?.completionTokens ?? 0;

  if (children) {
    return children;
  }

  if (!outputTokens) {
    return null;
  }

  return (
    <div
      className={cn("flex items-center justify-between text-xs", className)}
      {...props}
    >
      <span className="text-muted-foreground">Output</span>
      <TokensWithCost tokens={outputTokens} />
    </div>
  );
};

export type ContextReasoningUsageProps = ComponentProps<"div">;

export const ContextReasoningUsage = ({
  className,
  children,
  ...props
}: ContextReasoningUsageProps) => {
  const { usage } = useContextValue();
  const reasoningTokens = usage?.completionTokensDetails?.reasoningTokens ?? 0;

  if (children) {
    return children;
  }

  if (!reasoningTokens) {
    return null;
  }

  return (
    <div
      className={cn("flex items-center justify-between text-xs", className)}
      {...props}
    >
      <span className="text-muted-foreground">Reasoning</span>
      <TokensWithCost tokens={reasoningTokens} />
    </div>
  );
};

export type ContextCacheUsageProps = ComponentProps<"div">;

export const ContextCacheUsage = ({
  className,
  children,
  ...props
}: ContextCacheUsageProps) => {
  const { usage } = useContextValue();
  const cacheTokens = usage?.promptTokensDetails?.cachedTokens ?? 0;

  if (children) {
    return children;
  }

  if (!cacheTokens) {
    return null;
  }

  return (
    <div
      className={cn("flex items-center justify-between text-xs", className)}
      {...props}
    >
      <span className="text-muted-foreground">Cache</span>
      <TokensWithCost tokens={cacheTokens} />
    </div>
  );
};

const TokensWithCost = ({
  tokens,
  costText,
}: {
  tokens?: number;
  costText?: string;
}) => (
  <span>
    {tokens === undefined
      ? "—"
      : new Intl.NumberFormat("en-US", {
          notation: "compact",
        }).format(tokens)}
    {costText ? (
      <span className="ml-2 text-muted-foreground">• {costText}</span>
    ) : null}
  </span>
);
