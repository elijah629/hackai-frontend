import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Braces } from "lucide-react";
import { Slider } from "./ui/slider";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSet,
} from "@/components/ui/field";
import { ModelParameters } from "@/types/model-parameters";

export function ModelParameterModal({
  parameters,
  onChangeParameters,
}: {
  parameters: ModelParameters;
  onChangeParameters: (parameters: ModelParameters) => void;
}) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" size="icon">
          <Braces />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80">
        <FieldGroup>
          <FieldSet>
            <FieldLegend>Model Parameters</FieldLegend>
            <FieldDescription>
              Tweak parameters sent to the model
            </FieldDescription>
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="model-temperature-slider">
                  Temperature
                </FieldLabel>
                <div className="flex gap-4">
                  <Slider
                    id="model-temperature-slider"
                    min={0}
                    max={2}
                    step={0.1}
                    value={[parameters.temperature]}
                    onValueChange={(value) => {
                      onChangeParameters({
                        ...parameters,
                        temperature: value[0],
                      });
                    }}
                  />
                  <Input
                    min={0}
                    max={2}
                    step={0.1}
                    value={parameters.temperature}
                    onChange={(event) => {
                      if (!isNaN(event.target.valueAsNumber)) {
                        onChangeParameters({
                          ...parameters,
                          temperature: event.target.valueAsNumber,
                        });
                      }
                    }}
                    id="model-temperature-input"
                    className="w-24"
                    type="number"
                  />
                </div>
                <FieldDescription>
                  It is reccomended to set either temperature or topP but not
                  both.
                </FieldDescription>
              </Field>
            </FieldGroup>
          </FieldSet>
        </FieldGroup>
      </PopoverContent>
    </Popover>
  );
}
