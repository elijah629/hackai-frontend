import {
  ModelSelector,
  ModelSelectorContent,
  ModelSelectorEmpty,
  ModelSelectorGroup,
  ModelSelectorInput,
  ModelSelectorItem,
  ModelSelectorList,
  ModelSelectorLogo,
  ModelSelectorName,
  ModelSelectorTrigger,
} from "@/components/ai-elements/model-selector";
import { Badge } from "@/components/ui/badge";
import { getDisplayModelName } from "@/lib/utils";
import { Model } from "@/lib/hackclub";
import { CheckIcon } from "lucide-react";
import { PromptInputButton } from "../ai-elements/prompt-input";
import { useMemo } from "react";

type ChatModelSelectorProps = {
  models: Model[];
  chefs: string[];
  compatibilityByModel: Map<string, { missingInputs: string[] }>;
  hasModalRequirements: boolean;
  effectiveModel?: string;
  hasModels: boolean;
  activeModelData?: Model;
  modelSelectorOpen: boolean;
  setModelSelectorOpen: (open: boolean) => void;
  onSelect: (modelId: string) => void;
};

export function ChatModelSelector({
  models,
  chefs,
  compatibilityByModel,
  hasModalRequirements,
  effectiveModel,
  hasModels,
  activeModelData,
  modelSelectorOpen,
  setModelSelectorOpen,
  onSelect,
}: ChatModelSelectorProps) {
  const providerSlug = activeModelData?.id.split("/")[0];

  const badgesByModel = useMemo(() => {
    return new Map(
      models.map((model) => {
        const supportedInputs = model.architecture?.input_modalities ?? [];
        const missingInputs = compatibilityByModel.get(model.id)?.missingInputs ?? [];

        const badges = [
          ...supportedInputs.map((modality) => ({
            key: `input-${modality}`,
            label: modality,
            missing: false,
          })),
          ...(hasModalRequirements
            ? missingInputs.map((modality) => ({
                key: `missing-${modality}`,
                label: `Input: ${modality}`,
                missing: true,
              }))
            : []),
        ];

        return [model.id, badges];
      }),
    );
  }, [
    compatibilityByModel,
    hasModalRequirements,
    models,
  ]);

  return (
    <ModelSelector onOpenChange={setModelSelectorOpen} open={modelSelectorOpen}>
      <ModelSelectorTrigger asChild>
        <PromptInputButton disabled={!hasModels}>
          {providerSlug && <ModelSelectorLogo provider={providerSlug} />}
          <ModelSelectorName>
            {activeModelData
              ? getDisplayModelName(activeModelData.chef, activeModelData.name)
              : hasModels
                ? "Select a compatible model"
                : "No models available"}
          </ModelSelectorName>
        </PromptInputButton>
      </ModelSelectorTrigger>
      <ModelSelectorContent>
        <ModelSelectorInput placeholder="Search models..." />
        <ModelSelectorList>
          <ModelSelectorEmpty>No models found.</ModelSelectorEmpty>
          {chefs.map((chef) => (
            <ModelSelectorGroup key={chef} heading={chef}>
              {models
                .filter((m) => m.chef === chef)
                .map((m) => (
                  <ModelSelectorItem
                    key={m.id}
                    disabled={(compatibilityByModel.get(m.id)?.missingInputs.length ?? 0) > 0}
                    onSelect={() => {
                      onSelect(m.id);
                      setModelSelectorOpen(false);
                    }}
                    value={m.id}
                  >
                    <ModelSelectorLogo provider={m.chefSlug} />
                    <ModelSelectorName>
                      {getDisplayModelName(m.chef, m.name)}
                    </ModelSelectorName>
                    {effectiveModel === m.id && <CheckIcon className="ml-auto size-4" />}
                    <div className="flex flex-wrap items-center gap-2">
                      {badgesByModel.get(m.id)?.map((badge) => (
                        <Badge
                          key={badge.key}
                          variant={badge.missing ? "destructive" : "outline"}
                        >
                          {badge.label}
                        </Badge>
                      ))}
                    </div>
                  </ModelSelectorItem>
                ))}
            </ModelSelectorGroup>
          ))}
        </ModelSelectorList>
      </ModelSelectorContent>
    </ModelSelector>
  );
}
