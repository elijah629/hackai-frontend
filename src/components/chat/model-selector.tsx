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
import { useMemo, useState } from "react";

type ChatModelSelectorProps = {
  models: Model[];
  modelData: Model;

  onSelect: (modelId: string) => void;
};

export function ChatModelSelector({
  models,
  modelData,
  onSelect,
}: ChatModelSelectorProps) {
  const [modelSelectorOpen, setModelSelectorOpen] = useState(false);

  const providerSlug = useMemo(
    () => modelData.id.split("/")[0],
    [modelData.id],
  );

  const chefs: string[] = useMemo(
    () => Array.from(new Set(models.map((x) => x.chef))).sort(),
    [models],
  );

  return (
    <ModelSelector onOpenChange={setModelSelectorOpen} open={modelSelectorOpen}>
      <ModelSelectorTrigger asChild>
        <PromptInputButton>
          {providerSlug && <ModelSelectorLogo provider={providerSlug} />}
          <ModelSelectorName>
            {getDisplayModelName(modelData.chef, modelData.name)}
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
                .map((m) => {
                  const supportedInputs = m.architecture.input_modalities
                    .filter((x) => x !== "text")
                    .sort();

                  return (
                    <ModelSelectorItem
                      key={m.id}
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
                      {modelData.id === m.id && (
                        <CheckIcon className="ml-auto size-4" />
                      )}
                      <div className="flex flex-wrap items-center gap-2">
                        {supportedInputs.map((badge) => (
                          <Badge key={"input-" + badge} variant="outline">
                            {badge}
                          </Badge>
                        ))}
                      </div>
                    </ModelSelectorItem>
                  );
                })}
            </ModelSelectorGroup>
          ))}
        </ModelSelectorList>
      </ModelSelectorContent>
    </ModelSelector>
  );
}
