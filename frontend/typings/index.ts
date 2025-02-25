import { z } from "zod";

const MetadataSchema = z.object({
  FileType: z.string(),
  FileSize: z.number(),
  UploadDate: z.string(),
  Views: z.number(),
});

const UploadSchema = z.object({
  _id: z.string(),
  IP: z.string(),
  Key: z.string(),
  DisplayName: z.string(),
  FileName: z.string(),
  Metadata: MetadataSchema,
});

const ApiResponseSchema = z.object({
  uploads: z.array(UploadSchema),
});

const NewAccountSchema = z.object({
  DisplayName: z.string(),
  key: z.string(),
  Domain: z.string(),
});

const UrlSchema = z.object({
  Key: z.string(),
  URL: z.string(),
  CreatedAt: z.string(),
  IP: z.string(),
  Slug: z.string(),
  Clicks: z.number(),
});

const ApiResponseUrlSchema = z.object({
  status: z.number(),
  urls: z.array(UrlSchema),
});

const ConfigTypeSchema = z.enum(["upload", "url", "text"]);

export type Metadata = z.infer<typeof MetadataSchema>;
export type Upload = z.infer<typeof UploadSchema>;
export type ApiResponse = z.infer<typeof ApiResponseSchema>;
export type NewAccount = z.infer<typeof NewAccountSchema>;
export type Url = z.infer<typeof UrlSchema>;
export type ApiResponseUrl = z.infer<typeof ApiResponseUrlSchema>;
export type ConfigType = z.infer<typeof ConfigTypeSchema>;

export {
  MetadataSchema,
  UploadSchema,
  ApiResponseSchema,
  NewAccountSchema,
  UrlSchema,
  ApiResponseUrlSchema,
  ConfigTypeSchema,
};
