export const fileTypeSchema = ({
  type: 'object',
  additionalProperties: true,
  properties: {
    size: { type: 'number', nullable: false },
    path: { type: 'string', format: 'uri-template', nullable: false },
    name: { type: 'string', nullable: false },
    type: { type: 'string', pattern: 'application/octet-stream', nullable: false },
  },
  nullable: false,
});
