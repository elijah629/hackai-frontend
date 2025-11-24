import { useCallback, useMemo } from "react";
import { Model } from "@/lib/hackclub";

const normalizeModality = (mediaType?: string | null) => {
  if (!mediaType) return null;
  if (mediaType.startsWith("image/")) return "image";
  if (mediaType.startsWith("audio/")) return "audio";
  if (mediaType.startsWith("video/")) return "video";
  return null;
};

const collectModalitiesFromAttachments = (attachments: any[] = []) => {
  const modalities = new Set<string>();

  for (const attachment of attachments) {
    const mediaType =
      attachment.mediaType ||
      attachment.contentType ||
      attachment.mimeType ||
      attachment.mime_type;

    const modality = normalizeModality(mediaType);
    if (modality) modalities.add(modality);
  }

  return modalities;
};

export function useRequiredModalities(messages: any[]) {
  const requiredInputModalities = useMemo(() => {
    const requirements = new Set<string>(["text"]);
    for (const message of messages) {
      const attachmentModalities = collectModalitiesFromAttachments(
        message.parts?.filter((part: any) => part.type === "file"),
      );
      const outputAttachmentModalities = collectModalitiesFromAttachments(
        message.experimental_attachments ?? message.experimentalAttachments,
      );

      for (const modality of [
        ...attachmentModalities,
        ...outputAttachmentModalities,
      ]) {
        requirements.add(modality);
      }
    }
    return requirements;
  }, [messages]);

  const hasModalRequirements = Array.from(requiredInputModalities).some(
    (modality) => modality !== "text",
  );

  return {
    requiredInputModalities,
    hasModalRequirements,
  };
}

export function useModelCompatibility(
  models: Model[],
  requiredInputModalities: Set<string>,
) {
  const computeCompatibility = useCallback(
    (model: Model) => {
      const inputs = new Set(model.architecture?.input_modalities ?? []);

      return {
        missingInputs: Array.from(requiredInputModalities).filter(
          (req) => !inputs.has(req),
        ),
      };
    },
    [requiredInputModalities],
  );

  const compatibilityByModel = useMemo(() => {
    const map = new Map<string, { missingInputs: string[] }>();
    for (const m of models) {
      map.set(m.id, computeCompatibility(m));
    }
    return map;
  }, [computeCompatibility, models]);

  const isModelCompatible = useCallback(
    (model?: Model) => {
      if (!model) return false;
      const compatibility = compatibilityByModel.get(model.id);
      return !!compatibility && compatibility.missingInputs.length === 0;
    },
    [compatibilityByModel],
  );

  const firstCompatibleModelId = useMemo(
    () => models.find((m) => isModelCompatible(m))?.id,
    [isModelCompatible, models],
  );

  const hasModels = models.length > 0;
  const hasCompatibleModels = Boolean(firstCompatibleModelId);

  return {
    compatibilityByModel,
    isModelCompatible,
    firstCompatibleModelId,
    hasModels,
    hasCompatibleModels,
  };
}

export function normalizeSubmissionModalities(message: any) {
  const submissionInputRequirements = new Set<string>();
  if (message.text?.trim()) submissionInputRequirements.add("text");
  if (message.files?.length) {
    for (const file of message.files) {
      const modality = normalizeModality(file.mediaType);
      if (modality) submissionInputRequirements.add(modality);
    }
  }

  return submissionInputRequirements;
}

export { normalizeModality };
