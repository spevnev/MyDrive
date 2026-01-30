# MyDrive

Frontend for MyDrive, a cloud file storage and sharing platform built with React and TypeScript.

## Features

- File upload, download, and organization
- Secure file sharing with role-based access control
- Direct client-to-S3 uploads using presigned URLs
- JWT-based authentication

## Prerequisites

- Node.js v22+
- [API](https://github.com/spevnev/MyDriveApi) running

## Running

Install dependencies:
```shell
npm install
```
Configure backend URL in `src/config.ts`

### Development

```shell
npm run start
```

### Production

```shell
npm run build
```

### Docker

```shell
npm run build
docker build -t mydrive-frontend .
docker run -p 3000:80 mydrive-frontend
```
