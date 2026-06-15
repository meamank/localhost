import { ModelMeta } from "@/src/types/index";
import { models } from "react-native-executorch";

function getUIMetadata(id: string) {
  const logos = {
    meta: "https://cdn-avatars.huggingface.co/v1/production/uploads/646cf8084eefb026fb8fd8bc/oCTqufkdTkjyGodsx1vo1.png",
    qwen: "https://cdn-avatars.huggingface.co/v1/production/uploads/620760a26e3b7210c2ff1943/-s1gyJfvbE1RgO5iBeNOi.png",
    microsoft:
      "https://cdn-avatars.huggingface.co/v1/production/uploads/1583646260758-5e64858c87403103f9f1055d.png",
    huggingface:
      "https://cdn-avatars.huggingface.co/v1/production/uploads/651e96991b97c9f33d26bde6/e4VK7uW5sTeCYupD0s_ob.png",
    liquidAI:
      "https://cdn-avatars.huggingface.co/v1/production/uploads/61b8e2ba285851687028d395/EsTgVtnM2IqVRKgPdfqcB.png",
  };

  const nameLower = id.toLowerCase();

  if (nameLower.includes("llama")) return { org: "Meta", logo_url: logos.meta };
  if (nameLower.includes("qwen")) return { org: "Qwen", logo_url: logos.qwen };
  if (nameLower.includes("phi"))
    return { org: "Microsoft", logo_url: logos.microsoft };
  if (nameLower.includes("smollm"))
    return { org: "HuggingFace", logo_url: logos.huggingface };
  if (nameLower.includes("LFM"))
    return { org: "LiquidAI", logo_url: logos.liquidAI };

  return { org: "Community", logo_url: logos.huggingface }; // Fallback
}

export const getModelsData = (): ModelMeta[] => {
  const allModels = Object.values(models.llm);

  const configArray = allModels.map((modelFn: any) => {
    // (passing { quant: true } defaults to the quantized version if available)
    const config = modelFn({ quant: true });

    const id = config.modelName;
    const uiMeta = getUIMetadata(id);

    return {
      id,
      org: uiMeta.org,
      logo_url: uiMeta.logo_url,
      name: id.replace(/_|-/g, " ").toUpperCase(),
      description: `${uiMeta.org} model optimized for ExecuTorch`,
      fileName: id,
      downloadUrl: config.modelSource,
      tokenizerUrl: config.tokenizerSource,
      tokenizerConfigUrl: config.tokenizerConfigSource,
    } as ModelMeta;
  });

  return configArray;
};

export const AVAILABLE_MODELS: ModelMeta[] = getModelsData();
