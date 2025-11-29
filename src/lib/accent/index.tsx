// like next-themes but for accent colors

"use client";

import * as React from "react";

type AccentName = string;
type DataAttribute = `data-${string}`;

export interface UseAccentProps {
  /** Active accent name (after forcedAccent is applied) */
  accent: AccentName;
  /** All available accents */
  accents: AccentName[];
  /** Forced accent for the current page (if any) */
  forcedAccent?: AccentName;
  /** Update the accent (and persist to localStorage) */
  setAccent: React.Dispatch<React.SetStateAction<AccentName>>;
}

export interface AccentProviderProps {
  /**
   * The single root element to decorate.
   * e.g. <html>, <body>, or your app root.
   */
  children: React.ReactElement;

  /** Default accent name (used on first load / when nothing in localStorage) */
  defaultAccent: AccentName;

  /** List of all available accents (optional, inferred from `value` or state if not provided) */
  accents?: AccentName[];

  /** Key used to store accent setting in localStorage */
  storageKey?: string;

  /**
   * HTML data attribute to set on the child.
   * e.g. "data-accent", "data-color", etc.
   */
  attribute?: DataAttribute;

  /**
   * Mapping accent name -> attribute value.
   * e.g. { blue: "blue", red: "danger", green: "success" }
   *
   * If omitted, the accent name itself is used as the attribute value.
   */
  value?: Record<AccentName, string>;

  /**
   * Force a specific accent for this subtree, ignoring the user preference
   * (the preference is still updated in localStorage when calling setAccent).
   */
  forcedAccent?: AccentName;

  /**
   * Name of the CSS custom property to set to the current accent.
   *
   * By default this will set:
   *   --primary: var(--{accentValue})
   *
   * - Set to a custom name (e.g. "--brand") to change it.
   * - Set to `false` to disable setting any CSS variable.
   */
  cssVarForAccent?: `--${string}` | false;
}

const AccentContext = React.createContext<UseAccentProps | undefined>(
  undefined,
);

export const useAccent = () => {
  const ctx = React.useContext(AccentContext);
  if (!ctx) {
    throw new Error("useAccent must be used inside an <AccentProvider />");
  }
  return ctx;
};

export const AccentProvider: React.FC<AccentProviderProps> = ({
  children,
  defaultAccent,
  accents,
  storageKey = "accent",
  attribute = "data-accent",
  value,
  forcedAccent,
  cssVarForAccent = "--primary",
}) => {
  // Raw accent state (user preference)
  const [accentState, setAccentState] =
    React.useState<AccentName>(defaultAccent);

  // On mount, hydrate from localStorage
  React.useEffect(() => {
    try {
      const stored = window.localStorage.getItem(storageKey);
      if (stored) {
        setAccentState(stored as AccentName);
      }
    } catch {
      // ignore
    }
  }, [storageKey]);

  // Setter that also writes to localStorage
  const setAccent = React.useCallback(
    (update: React.SetStateAction<AccentName>) => {
      setAccentState((prev) => {
        const next =
          typeof update === "function"
            ? (update as (prev: AccentName) => AccentName)(prev)
            : update;

        try {
          window.localStorage.setItem(storageKey, next);
        } catch {
          // ignore
        }

        return next;
      });
    },
    [storageKey],
  );

  // All accents known to the system
  const allAccents = React.useMemo<AccentName[]>(
    () =>
      accents && accents.length
        ? accents
        : value
          ? Object.keys(value)
          : (Array.from(
              new Set([defaultAccent, accentState].filter(Boolean)),
            ) as AccentName[]),
    [accents, value, defaultAccent, accentState],
  );

  // What the UI should actually use for this tree
  const effectiveAccent = forcedAccent ?? accentState;
  const attributeValue = (value && value[effectiveAccent]) ?? effectiveAccent;

  // Clone the single child and add data-accent="..." and --primary: var(--{accent})
  const decoratedChild = React.useMemo(() => {
    const onlyChild = React.Children.only(children) as React.ReactElement<any>;

    const extraProps: Record<string, any> = {};

    if (attribute) {
      extraProps[attribute] = attributeValue;
    }

    // Merge in CSS custom property for the accent
    if (cssVarForAccent) {
      const existingStyle = onlyChild.props.style || {};
      extraProps.style = {
        ...existingStyle,
        [cssVarForAccent]: `var(--${attributeValue})`,
      };
    }

    return React.cloneElement(onlyChild, {
      ...onlyChild.props,
      ...extraProps,
    });
  }, [children, attribute, attributeValue, cssVarForAccent]);

  const contextValue = React.useMemo<UseAccentProps>(
    () => ({
      accent: effectiveAccent,
      accents: allAccents,
      forcedAccent,
      setAccent,
    }),
    [effectiveAccent, allAccents, forcedAccent, setAccent],
  );

  return (
    <AccentContext.Provider value={contextValue}>
      {decoratedChild}
    </AccentContext.Provider>
  );
};
