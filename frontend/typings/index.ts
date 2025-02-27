import { z } from "zod";

const MetadataSchema = z.object({
  fileType: z.string(),
  fileSize: z.number(),
  uploadDate: z.string(),
  views: z.number(),
});

const UploadSchema = z.object({
  _id: z.string(),
  ip: z.string(),
  key: z.string(),
  displayName: z.string(),
  fileName: z.string(),
  metadata: MetadataSchema,
});

const ApiResponseSchema = z.object({
  uploads: z.array(UploadSchema),
});

const NewAccountSchema = z.object({
  displayName: z.string(),
  key: z.string(),
  domain: z.string(),
});

const UrlSchema = z.object({
  key: z.string(),
  url: z.string(),
  createdAt: z.string(),
  ip: z.string(),
  slug: z.string(),
  clicks: z.number(),
});

const ApiResponseUrlSchema = z.object({
  status: z.number(),
  urls: z.array(UrlSchema),
});

const ConfigTypeSchema = z.enum(["upload", "url", "text"]);

const UserStateSchema = z.object({
  apiToken: z.string(),
  setToken: z.function().args(z.string()).returns(z.void()),
  displayName: z.string(),
  setDisplayName: z.function().args(z.string()).returns(z.void()),
  domain: z.string(),
  setDomain: z.function().args(z.string()).returns(z.void()),
  loading: z.boolean(),
  setLoading: z.function().args(z.boolean()).returns(z.void()),
  urls: z.array(UrlSchema),
  setUrls: z.function().args(z.array(UrlSchema)).returns(z.void()),
  addUrl: z.function().args(UrlSchema).returns(z.void()),
  removeUrl: z.function().args(z.string()).returns(z.void()),
  updateUrl: z.function().args(z.string(), z.string()).returns(z.void()),
  uploads: z.array(UploadSchema),
  setUploads: z.function().args(z.array(UploadSchema)).returns(z.void()),
  addUpload: z.function().args(UploadSchema).returns(z.void()),
  removeUpload: z.function().args(z.string()).returns(z.void()),
  availableDomains: z.array(z.string()),
  setAvailableDomains: z.function().args(z.array(z.string())).returns(z.void()),
});

export type Metadata = z.infer<typeof MetadataSchema>;
export type Upload = z.infer<typeof UploadSchema>;
export type ApiResponse = z.infer<typeof ApiResponseSchema>;
export type NewAccount = z.infer<typeof NewAccountSchema>;
export type Url = z.infer<typeof UrlSchema>;
export type ApiResponseUrl = z.infer<typeof ApiResponseUrlSchema>;
export type ConfigType = z.infer<typeof ConfigTypeSchema>;
export type UserState = z.infer<typeof UserStateSchema>;

export {
  MetadataSchema,
  UploadSchema,
  ApiResponseSchema,
  NewAccountSchema,
  UrlSchema,
  ApiResponseUrlSchema,
  ConfigTypeSchema,
  UserStateSchema,
};
